export type VoiceHandle = {
	parts: OscillatorNode[]
	env: GainNode
	stopAt: number
	sustainLevel: number
	attackEndTime: number
	decayEndTime: number
	releaseTime: number
}

export type FilterTarget = 'notes' | 'chords'
export type SynthWaveform = OscillatorType | 'soft-square' | 'tape-stack'

const SILENCE_FLOOR = 0.0001

export type EnvelopeParams = {
	attack: number
	decay: number
	sustain: number
	release: number
}

export interface SynthParams {
	wave: SynthWaveform
	chordWave: SynthWaveform
	voices: number // unison voices
	chordVoices: number
	detuneSpread: number // cents total spread
	chordDetuneSpread: number
	stereoWidth: number
	chordStereoWidth: number
	drive: number // normalized saturation amount
	filterEnvelopeAmount: number // normalized four-octave sweep
	filterEnvelopeDecay: number // seconds
	env: EnvelopeParams
	chordEnv: EnvelopeParams
	filterNotes: { cutoff: number; q: number; type: BiquadFilterType }
	filterChords: { cutoff: number; q: number; type: BiquadFilterType }
	fx: {
		tremoloOn: boolean
		tremoloDepth: number
		tremoloRate: number
		vibratoOn: boolean
		vibratoDepth: number
		vibratoRate: number
		chorusOn: boolean
		chorusRate: number
		chorusDepthMs: number
		chorusMix: number
		delayOn: boolean
		delayTime: number
		delayFeedback: number
		delayMix: number
		reverbOn: boolean
		reverbTime: number
		reverbMix: number
	}
}

export class SynthEngine {
	readonly ctx: AudioContext
	readonly master: GainNode
	readonly compressor: DynamicsCompressorNode
	private activeVoices: Set<VoiceHandle> = new Set()
	private cleanupTimer: ReturnType<typeof setInterval> | undefined

	// building blocks
	private filterNotes: BiquadFilterNode
	private filterChords: BiquadFilterNode
	private drive: WaveShaperNode
	private driveMakeup: GainNode
	private tapeStackWave: PeriodicWave
	private softSquareWave: PeriodicWave
	private appliedDrive = Number.NaN
	private tremLFO: OscillatorNode
	private tremGain: GainNode
	private vibrLFO: OscillatorNode
	private vibrGain: GainNode
	private chorusDelayL: DelayNode
	private chorusDelayR: DelayNode
	private chorusLFO: OscillatorNode
	private chorusGainL: GainNode
	private chorusGainR: GainNode
	private chorusMix: GainNode
	private chorusBypass: GainNode
	private delay: DelayNode
	private delayFb: GainNode
	private delayMix: GainNode
	private delayDry: GainNode
	private reverb: ConvolverNode
	private reverbMix: GainNode
	private reverbDry: GainNode

	params: SynthParams

	constructor(ctx: AudioContext, params: Partial<SynthParams> = {}) {
		this.ctx = ctx
		this.master = new GainNode(ctx, { gain: 0.46 })

		// Preserve fullness without the pumping caused by fast, heavy compression.
		this.compressor = new DynamicsCompressorNode(ctx, {
			threshold: -12,
			knee: 18,
			ratio: 2,
			attack: 0.015,
			release: 0.18,
		})

		// Use a gentler filter curve for cleaner sound
		// Separate filters for notes and chords
		this.filterNotes = new BiquadFilterNode(ctx, {
			type: 'lowpass',
			frequency: 6000, // Higher default for more brightness
			Q: 0.5, // Lower Q to avoid resonance peaks
		})
		this.filterChords = new BiquadFilterNode(ctx, {
			type: 'lowpass',
			frequency: 4000, // Slightly darker default for chords
			Q: 0.7, // Slightly higher Q for chords
		})
		this.drive = new WaveShaperNode(ctx, {
			curve: buildDriveCurve(0),
			oversample: '4x',
		})
		this.driveMakeup = new GainNode(ctx, { gain: 1 })
		this.tapeStackWave = buildTapeStackWave(ctx)
		this.softSquareWave = buildSoftSquareWave(ctx)

		// Tremolo (amplitude)
		this.tremLFO = new OscillatorNode(ctx, { frequency: 5, type: 'sine' })
		this.tremGain = new GainNode(ctx, { gain: 0 }) // mod depth
		this.tremLFO.connect(this.tremGain).connect(this.master.gain)
		this.tremLFO.start()

		// Vibrato (pitch)
		this.vibrLFO = new OscillatorNode(ctx, { frequency: 5, type: 'sine' })
		this.vibrGain = new GainNode(ctx, { gain: 0 }) // routed per-voice
		this.vibrLFO.connect(this.vibrGain)
		this.vibrLFO.start()

		// Opposing delay modulation creates width without pitchy movement.
		this.chorusDelayL = new DelayNode(ctx, { delayTime: 0.018 })
		this.chorusDelayR = new DelayNode(ctx, { delayTime: 0.022 })
		this.chorusLFO = new OscillatorNode(ctx, { frequency: 0.4, type: 'sine' })
		this.chorusGainL = new GainNode(ctx, { gain: 0.002 })
		this.chorusGainR = new GainNode(ctx, { gain: -0.002 })
		this.chorusLFO.connect(this.chorusGainL)
		this.chorusLFO.connect(this.chorusGainR)
		this.chorusGainL.connect(this.chorusDelayL.delayTime)
		this.chorusGainR.connect(this.chorusDelayR.delayTime)
		this.chorusMix = new GainNode(ctx, { gain: 0 })
		this.chorusBypass = new GainNode(ctx, { gain: 1 })
		this.chorusLFO.start()

		// Delay with feedback limiting to prevent mud
		this.delay = new DelayNode(ctx, { delayTime: 0.28, maxDelayTime: 2.0 })
		this.delayFb = new GainNode(ctx, { gain: 0.25 }) // Lower feedback
		this.delayMix = new GainNode(ctx, { gain: 0 })
		this.delayDry = new GainNode(ctx, { gain: 1 })
		this.delay.connect(this.delayFb).connect(this.delay)
		// Reverb-ish (simple impulse build)
		this.reverb = new ConvolverNode(ctx, { disableNormalization: false })
		this.reverb.buffer = buildSimpleImpulse(ctx, 1.8)
		this.reverbMix = new GainNode(ctx, { gain: 0 })
		this.reverbDry = new GainNode(ctx, { gain: 1 })

		// wire graph: filter -> (chorus split) -> (delay split) -> (reverb split) -> master -> destination
		const chorusInput = new GainNode(ctx)
		const chorusWet = new GainNode(ctx)
		const chorusPanL = new StereoPannerNode(ctx, { pan: -0.8 })
		const chorusPanR = new StereoPannerNode(ctx, { pan: 0.8 })
		chorusInput.connect(this.chorusDelayL).connect(chorusPanL).connect(chorusWet)
		chorusInput.connect(this.chorusDelayR).connect(chorusPanR).connect(chorusWet)
		chorusWet.connect(this.chorusMix)
		chorusInput.connect(this.chorusBypass)

		const postChorus = new GainNode(ctx)
		this.chorusBypass.connect(postChorus)
		this.chorusMix.connect(postChorus)

		postChorus.connect(this.delay)
		postChorus.connect(this.delayDry)
		this.delay.connect(this.delayMix)

		const postDelay = new GainNode(ctx)
		this.delayDry.connect(postDelay)
		this.delayMix.connect(postDelay)

		postDelay.connect(this.reverbDry)
		postDelay.connect(this.reverb)
		this.reverb.connect(this.reverbMix)

		this.reverbDry.connect(this.master)
		this.reverbMix.connect(this.master)
		// Route through compressor to destination
		this.master.connect(this.compressor)
		this.compressor.connect(ctx.destination)

		this.params = {
			wave: 'triangle',
			chordWave: 'triangle',
			voices: 3,
			chordVoices: 2,
			detuneSpread: 8, // Reduced for less phasiness
			chordDetuneSpread: 2.5,
			stereoWidth: 0.2,
			chordStereoWidth: 0.4,
			drive: 0,
			filterEnvelopeAmount: 0,
			filterEnvelopeDecay: 0.2,
			env: { attack: 0.005, decay: 0.05, sustain: 0.85, release: 0.05 },
			chordEnv: {
				attack: 0.04,
				decay: 0.18,
				sustain: 0.82,
				release: 0.3,
			},
			filterNotes: { cutoff: 6000, q: 0.5, type: 'lowpass' },
			filterChords: { cutoff: 4000, q: 0.7, type: 'lowpass' },
			fx: {
				tremoloOn: false,
				tremoloDepth: 0.0,
				tremoloRate: 5.0,
				vibratoOn: false,
				vibratoDepth: 0.0,
				vibratoRate: 5.0,
				chorusOn: false,
				chorusRate: 0.4,
				chorusDepthMs: 2,
				chorusMix: 0,
				delayOn: false,
				delayTime: 0.28,
				delayFeedback: 0.25,
				delayMix: 0,
				reverbOn: false,
				reverbTime: 1.8,
				reverbMix: 0,
			},
			...params,
		}

		// Keep optional drive downstream of both independently filtered buses.
		this.filterNotes.connect(this.drive)
		this.filterChords.connect(this.drive)
		this.drive.connect(this.driveMakeup).connect(chorusInput)

		this.applyParams()

		// Start cleanup timer
		this.cleanupTimer = this.startCleanupTimer()
	}

	applyParams() {
		const p = this.params

		// Apply filter settings for notes
		this.filterNotes.type = p.filterNotes.type
		this.filterNotes.frequency.value = p.filterNotes.cutoff
		this.filterNotes.Q.value = p.filterNotes.q

		// Apply filter settings for chords
		this.filterChords.type = p.filterChords.type
		this.filterChords.frequency.value = p.filterChords.cutoff
		this.filterChords.Q.value = p.filterChords.q
		this.applyDrive()

		// tremolo
		this.tremLFO.frequency.value = p.fx.tremoloRate
		this.tremGain.gain.value = p.fx.tremoloOn ? p.fx.tremoloDepth : 0
		this.vibrLFO.frequency.value = p.fx.vibratoRate
		this.vibrGain.gain.value = p.fx.vibratoOn ? p.fx.vibratoDepth : 0

		// chorus
		this.chorusLFO.frequency.value = p.fx.chorusRate
		this.chorusGainL.gain.value = p.fx.chorusDepthMs / 1000
		this.chorusGainR.gain.value = -p.fx.chorusDepthMs / 1000
		this.chorusMix.gain.value = p.fx.chorusOn ? p.fx.chorusMix : 0

		// delay
		this.delay.delayTime.value = p.fx.delayTime
		this.delayFb.gain.value = p.fx.delayFeedback
		this.delayMix.gain.value = p.fx.delayOn ? p.fx.delayMix : 0

		// reverb (rebuild if time changed)
		this.reverbMix.gain.value = p.fx.reverbOn ? p.fx.reverbMix : 0
	}

	setFilterCutoff(v: number, target: FilterTarget = 'notes') {
		const now = this.ctx.currentTime
		if (target === 'notes') {
			this.params.filterNotes.cutoff = v
			this.filterNotes.frequency.cancelScheduledValues(now)
			this.filterNotes.frequency.setValueAtTime(v, now)
		} else {
			this.params.filterChords.cutoff = v
			this.filterChords.frequency.cancelScheduledValues(now)
			this.filterChords.frequency.setValueAtTime(v, now)
		}
	}
	setFilterQ(v: number, target: FilterTarget = 'notes') {
		if (target === 'notes') {
			this.params.filterNotes.q = v
			this.filterNotes.Q.value = v
		} else {
			this.params.filterChords.q = v
			this.filterChords.Q.value = v
		}
	}
	setDetuneSpread(cents: number, target: FilterTarget = 'notes') {
		if (target === 'notes') {
			this.params.detuneSpread = cents
		} else {
			this.params.chordDetuneSpread = cents
		}
	}
	setAttack(sec: number) {
		this.params.env.attack = sec
	}
	setRelease(sec: number) {
		this.params.env.release = sec
	}

	setDrive(amount: number) {
		this.params.drive = Math.min(1, Math.max(0, amount))
		this.applyDrive()
	}

	setFilterEnvelope(amount: number, decay: number) {
		this.params.filterEnvelopeAmount = Math.min(1, Math.max(0, amount))
		this.params.filterEnvelopeDecay = Math.max(0.01, decay)
	}

	setWave(w: SynthWaveform, target: FilterTarget = 'notes') {
		if (target === 'notes') {
			this.params.wave = w
		} else {
			this.params.chordWave = w
		}
	}
	setVoices(n: number, target: FilterTarget = 'notes') {
		if (target === 'notes') {
			this.params.voices = n
		} else {
			this.params.chordVoices = n
		}
	}
	setStereoWidth(width: number, target: FilterTarget = 'notes') {
		if (target === 'notes') {
			this.params.stereoWidth = width
		} else {
			this.params.chordStereoWidth = width
		}
	}
	setChordEnvelope(env: EnvelopeParams) {
		this.params.chordEnv = { ...env }
	}

	setTremolo(on: boolean) {
		this.params.fx.tremoloOn = on
		this.applyParams()
	}
	setVibrato(on: boolean) {
		this.params.fx.vibratoOn = on
		this.applyParams()
	}
	setChorus(on: boolean) {
		this.params.fx.chorusOn = on
		this.applyParams()
	}
	setDelay(on: boolean) {
		this.params.fx.delayOn = on
		this.applyParams()
	}
	setReverb(on: boolean) {
		this.params.fx.reverbOn = on
		this.applyParams()
	}

	setMacroA(x: number, y: number) {
		// X -> trem depth, Y -> vibrato depth
		this.params.fx.tremoloDepth = x * 0.9
		this.params.fx.vibratoDepth = y * 20 // cents

		// Auto-enable effects when joystick is moved away from center
		this.params.fx.tremoloOn = x > 0.1
		this.params.fx.vibratoOn = y > 0.1

		// Apply tremolo immediately
		this.tremGain.gain.value = this.params.fx.tremoloOn
			? this.params.fx.tremoloDepth
			: 0
		this.vibrGain.gain.value = this.params.fx.vibratoOn
			? this.params.fx.vibratoDepth
			: 0
	}

	setMacroB(x: number, y: number) {
		// X -> chorus mix, Y -> delay mix
		this.params.fx.chorusMix = x
		this.params.fx.delayMix = y

		// Auto-enable effects when joystick is moved away from center
		this.params.fx.chorusOn = x > 0.1
		this.params.fx.delayOn = y > 0.1

		// Apply immediately
		this.chorusMix.gain.value = this.params.fx.chorusOn
			? this.params.fx.chorusMix
			: 0
		this.delayMix.gain.value = this.params.fx.delayOn
			? this.params.fx.delayMix
			: 0
	}

	// ——— Voice handling ———
	noteOn(
		freqs: number[],
		filterTarget: FilterTarget = 'notes',
		velocity = 1,
	): VoiceHandle[] {
		const now = this.ctx.currentTime
		const envelope =
			filterTarget === 'notes' ? this.params.env : this.params.chordEnv
		const voices = freqs.map((f) => this.spawnVoice(f, filterTarget))
		this.triggerFilterEnvelope(filterTarget, now)

		// Scale gain based on number of notes to prevent clipping in chords
		const chordGainScale = 1 / Math.sqrt(freqs.length)

		// ADSR envelope
		for (const v of voices) {
			this.activeVoices.add(v)
			v.env.gain.cancelScheduledValues(now)

			const peakLevel = chordGainScale * velocity
			const sustainLevel = Math.max(
				SILENCE_FLOOR,
				envelope.sustain * chordGainScale * velocity,
			)
			const attackTime = envelope.attack
			const decayTime = envelope.decay

			// Store timing and sustain level for later use in noteOff
			v.sustainLevel = sustainLevel
			v.attackEndTime = now + attackTime
			v.decayEndTime = now + attackTime + decayTime
			v.releaseTime = envelope.release

			// Attack phase: 0 -> peak
			v.env.gain.setValueAtTime(SILENCE_FLOOR, now)
			v.env.gain.exponentialRampToValueAtTime(peakLevel, now + attackTime)

			// Decay phase: peak -> sustain
			// Then the sustain level will hold indefinitely until noteOff
			v.env.gain.exponentialRampToValueAtTime(
				sustainLevel,
				now + attackTime + decayTime,
			)
		}
		return voices
	}

	noteOff(voices: VoiceHandle[]) {
		const now = this.ctx.currentTime
		for (const v of voices) {
			if (Number.isFinite(v.stopAt)) continue

			try {
				v.env.gain.cancelAndHoldAtTime(now)
			} catch {
				v.env.gain.cancelScheduledValues(now)
				v.env.gain.setValueAtTime(
					Math.max(SILENCE_FLOOR, v.sustainLevel),
					now,
				)
			}

			v.env.gain.exponentialRampToValueAtTime(
				SILENCE_FLOOR,
				now + v.releaseTime,
			)

			v.stopAt = now + v.releaseTime + 0.02
			v.parts.forEach((oscillator) => oscillator.stop(v.stopAt))
		}
	}

	private spawnVoice(freq: number, filterTarget: FilterTarget): VoiceHandle {
		// Safety check for valid frequency
		if (!isFinite(freq) || freq <= 0) {
			console.warn('Invalid frequency:', freq)
			freq = 440 // fallback to A4
		}

		const wave =
			filterTarget === 'notes' ? this.params.wave : this.params.chordWave
		const voiceCount =
			filterTarget === 'notes'
				? this.params.voices
				: this.params.chordVoices
		const detuneSpread =
			filterTarget === 'notes'
				? this.params.detuneSpread
				: this.params.chordDetuneSpread
		const stereoWidth =
			filterTarget === 'notes'
				? this.params.stereoWidth
				: this.params.chordStereoWidth

		// Keep the main oscillator centered and spread quiet unison layers around it.
		const parts: OscillatorNode[] = []
		const mix = new GainNode(this.ctx)
		for (let i = 0; i < voiceCount; i++) {
			const o = new OscillatorNode(this.ctx, {
				frequency: freq,
			})
			if (wave === 'tape-stack') {
				o.setPeriodicWave(this.tapeStackWave)
			} else if (wave === 'soft-square') {
				o.setPeriodicWave(this.softSquareWave)
			} else {
				o.type = wave
			}
			const cents =
				voiceCount === 1
					? 0
					: ((i / (voiceCount - 1)) * 2 - 1) * detuneSpread
			o.detune.value = cents
			// vibrato routing
			if (this.params.fx.vibratoOn) this.vibrGain.connect(o.frequency)
			const layerGain = new GainNode(this.ctx, { gain: 1 / voiceCount })
			const pan =
				voiceCount === 1
					? 0
					: ((i / (voiceCount - 1)) * 2 - 1) * stereoWidth
			const panner = new StereoPannerNode(this.ctx, { pan })
			o.connect(layerGain).connect(panner).connect(mix)
			o.start()
			parts.push(o)
		}

		const env = new GainNode(this.ctx, { gain: 0 })
		mix.connect(env)

		// Route to the appropriate filter based on target
		const targetFilter =
			filterTarget === 'notes' ? this.filterNotes : this.filterChords
		env.connect(targetFilter)

		return {
			parts,
			env,
			stopAt: Infinity,
			sustainLevel: 0,
			attackEndTime: 0,
			decayEndTime: 0,
			releaseTime: 0,
		}
	}

	private triggerFilterEnvelope(target: FilterTarget, now: number) {
		const filter = target === 'notes' ? this.filterNotes : this.filterChords
		const base =
			target === 'notes'
				? this.params.filterNotes.cutoff
				: this.params.filterChords.cutoff
		const amount = this.params.filterEnvelopeAmount

		filter.frequency.cancelScheduledValues(now)
		filter.frequency.setValueAtTime(base, now)
		if (target === 'chords' || amount <= 0) return

		const peak = Math.min(
			this.ctx.sampleRate * 0.45,
			base * 2 ** (amount * 4),
		)
		filter.frequency.exponentialRampToValueAtTime(peak, now + 0.02)
		filter.frequency.exponentialRampToValueAtTime(
			base,
			now + 0.02 + this.params.filterEnvelopeDecay,
		)
	}

	private applyDrive() {
		if (this.params.drive === this.appliedDrive) return
		this.appliedDrive = this.params.drive
		this.drive.curve = buildDriveCurve(this.appliedDrive)
		this.driveMakeup.gain.value = 1 - this.appliedDrive * 0.32
	}

	destroy() {
		if (this.cleanupTimer !== undefined) {
			clearInterval(this.cleanupTimer)
			this.cleanupTimer = undefined
		}

		for (const voice of this.activeVoices) {
			voice.parts.forEach((oscillator) => {
				try {
					oscillator.stop()
				} catch {
					// The oscillator may already have stopped.
				}
				oscillator.disconnect()
			})
			voice.env.disconnect()
		}
		this.activeVoices.clear()
	}

	private startCleanupTimer() {
		return setInterval(() => {
			const now = this.ctx.currentTime
			for (const voice of this.activeVoices) {
				if (voice.stopAt < now) {
					// Stop and disconnect oscillators
					voice.parts.forEach((osc) => {
						try {
							osc.stop()
						} catch {
							// Oscillator might already be stopped
						}
						osc.disconnect()
					})
					// Disconnect envelope
					voice.env.disconnect()
					this.activeVoices.delete(voice)
				}
			}
		}, 100) // Check every 100ms
	}
}

function buildDriveCurve(amount: number) {
	const samples = 4096
	const curve = new Float32Array(samples)
	const normalizedAmount = Math.min(1, Math.max(0, amount))

	if (normalizedAmount === 0) {
		for (let i = 0; i < samples; i++) {
			curve[i] = (i / (samples - 1)) * 2 - 1
		}
		return curve
	}

	const drive = 1 + normalizedAmount * 4
	const normalization = Math.tanh(drive)
	for (let i = 0; i < samples; i++) {
		const input = (i / (samples - 1)) * 2 - 1
		curve[i] = Math.tanh(input * drive) / normalization
	}
	return curve
}

function buildTapeStackWave(ctx: BaseAudioContext) {
	const harmonicCount = 32
	const real = new Float32Array(harmonicCount + 1)
	const imaginary = new Float32Array(harmonicCount + 1)

	for (let harmonic = 1; harmonic <= harmonicCount; harmonic++) {
		const saw = 1 / harmonic
		const triangle =
			harmonic % 2 === 1
				? (harmonic % 4 === 1 ? 1 : -1) * (0.48 / harmonic ** 2)
				: 0
		const damping = Math.exp(-harmonic / 22)
		imaginary[harmonic] = (saw + triangle) * damping
	}

	return ctx.createPeriodicWave(real, imaginary, {
		disableNormalization: false,
	})
}

function buildSoftSquareWave(ctx: BaseAudioContext) {
	const harmonicCount = 31
	const real = new Float32Array(harmonicCount + 1)
	const imaginary = new Float32Array(harmonicCount + 1)

	for (let harmonic = 1; harmonic <= harmonicCount; harmonic += 2) {
		imaginary[harmonic] =
			(1 / harmonic) * Math.exp(-(harmonic - 1) / 12)
	}

	return ctx.createPeriodicWave(real, imaginary, {
		disableNormalization: false,
	})
}

function buildSimpleImpulse(ctx: AudioContext, seconds = 1.6) {
	const rate = ctx.sampleRate
	const len = (rate * seconds) | 0
	const buf = ctx.createBuffer(2, len, rate)

	for (let ch = 0; ch < 2; ch++) {
		const data = buf.getChannelData(ch)
		// Improved reverb with multiple decay rates and frequency-dependent decay
		for (let i = 0; i < len; i++) {
			const t = i / len
			// Exponential decay with high-frequency damping
			const decay = Math.pow(1 - t, 3) * Math.exp(-t * 2)
			// Add early reflections for more realistic space
			const earlyReflection = i < rate * 0.05 ? Math.exp(-i / (rate * 0.01)) : 0
			// Noise with stereo decorrelation
			const noise = (Math.random() * 2 - 1) * 0.5
			const stereoOffset = ch === 0 ? 0 : Math.sin(t * Math.PI * 4) * 0.2
			data[i] = (noise * decay + earlyReflection * 0.3) * (1 - stereoOffset)
		}
	}
	return buf
}
