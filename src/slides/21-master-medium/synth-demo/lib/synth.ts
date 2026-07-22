export type VoiceHandle = {
	parts: OscillatorNode[]
	env: GainNode
	stopAt: number
	sustainLevel: number
	attackEndTime: number
	decayEndTime: number
}

export type FilterTarget = 'notes' | 'chords'

export interface SynthParams {
	wave: OscillatorType
	voices: number // unison voices
	detuneSpread: number // cents total spread
	env: { attack: number; decay: number; sustain: number; release: number }
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
	private tremLFO: OscillatorNode
	private tremGain: GainNode
	private vibrLFO: OscillatorNode
	private vibrGain: GainNode
	private chorusDelayL: DelayNode
	private chorusDelayR: DelayNode
	private chorusLFO: OscillatorNode
	private chorusGain: GainNode
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
		// Lower master gain to prevent clipping when multiple notes play
		this.master = new GainNode(ctx, { gain: 0.5 })

		// Add gentle compression to prevent distortion and improve perceived loudness
		this.compressor = new DynamicsCompressorNode(ctx, {
			threshold: -24, // Start compressing at -24dB
			knee: 30, // Gentle knee for smooth compression
			ratio: 4, // 4:1 ratio
			attack: 0.003, // Fast attack to catch peaks
			release: 0.25, // Medium release
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

		// Improved Chorus with better stereo imaging
		this.chorusDelayL = new DelayNode(ctx, { delayTime: 0.02 })
		this.chorusDelayR = new DelayNode(ctx, { delayTime: 0.025 })
		this.chorusLFO = new OscillatorNode(ctx, { frequency: 0.4, type: 'sine' })
		this.chorusGain = new GainNode(ctx, { gain: 0.002 }) // Subtler modulation
		this.chorusLFO.connect(this.chorusGain)
		this.chorusGain.connect(this.chorusDelayL.delayTime)
		this.chorusGain.connect(this.chorusDelayR.delayTime)
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
		chorusInput.connect(this.chorusDelayL).connect(chorusWet)
		chorusInput.connect(this.chorusDelayR).connect(chorusWet)
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
			voices: 3,
			detuneSpread: 8, // Reduced for less phasiness
			env: { attack: 0.005, decay: 0.05, sustain: 0.85, release: 0.05 },
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

		// Connect both filters to chorus input
		this.filterNotes.connect(chorusInput)
		this.filterChords.connect(chorusInput)

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

		// tremolo
		this.tremLFO.frequency.value = p.fx.tremoloRate
		this.tremGain.gain.value = p.fx.tremoloOn ? p.fx.tremoloDepth : 0
		this.vibrLFO.frequency.value = p.fx.vibratoRate
		this.vibrGain.gain.value = p.fx.vibratoOn ? p.fx.vibratoDepth : 0

		// chorus
		this.chorusLFO.frequency.value = p.fx.chorusRate
		this.chorusGain.gain.value = p.fx.chorusDepthMs / 1000 // ms -> sec
		this.chorusMix.gain.value = p.fx.chorusOn ? p.fx.chorusMix : 0

		// delay
		this.delay.delayTime.value = p.fx.delayTime
		this.delayFb.gain.value = p.fx.delayFeedback
		this.delayMix.gain.value = p.fx.delayOn ? p.fx.delayMix : 0

		// reverb (rebuild if time changed)
		this.reverbMix.gain.value = p.fx.reverbOn ? p.fx.reverbMix : 0
	}

	setFilterCutoff(v: number, target: FilterTarget = 'notes') {
		if (target === 'notes') {
			this.params.filterNotes.cutoff = v
			this.filterNotes.frequency.value = v
		} else {
			this.params.filterChords.cutoff = v
			this.filterChords.frequency.value = v
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
	setDetuneSpread(cents: number) {
		this.params.detuneSpread = cents
	}
	setAttack(sec: number) {
		this.params.env.attack = sec
	}
	setRelease(sec: number) {
		this.params.env.release = sec
	}

	setWave(w: OscillatorType) {
		this.params.wave = w
	}
	setVoices(n: number) {
		this.params.voices = n
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
	noteOn(freqs: number[], filterTarget: FilterTarget = 'notes'): VoiceHandle[] {
		const now = this.ctx.currentTime
		const voices = freqs.map((f) => this.spawnVoice(f, filterTarget))

		// Scale gain based on number of notes to prevent clipping in chords
		const chordGainScale = 1 / Math.sqrt(freqs.length)

		// ADSR envelope
		for (const v of voices) {
			this.activeVoices.add(v)
			v.env.gain.cancelScheduledValues(now)

			const peakLevel = chordGainScale
			const sustainLevel = Math.max(
				0.01,
				this.params.env.sustain * chordGainScale,
			)
			const attackTime = this.params.env.attack
			const decayTime = this.params.env.decay

			// Store timing and sustain level for later use in noteOff
			v.sustainLevel = sustainLevel
			v.attackEndTime = now + attackTime
			v.decayEndTime = now + attackTime + decayTime

			// Attack phase: 0 -> peak
			v.env.gain.setValueAtTime(0.01, now)
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
			// Cancel any scheduled automations
			v.env.gain.cancelScheduledValues(now)

			// Calculate current gain level based on envelope phase
			let currentGain: number

			if (now < v.attackEndTime) {
				// Still in attack phase - use the current interpolated value
				// We can't easily calculate this, so just use sustainLevel as fallback
				currentGain = v.sustainLevel
			} else if (now < v.decayEndTime) {
				// Still in decay phase - interpolate between peak and sustain
				// For exponential ramps this is complex, so use sustain as approximation
				currentGain = v.sustainLevel
			} else {
				// In sustain phase - use the sustain level
				currentGain = v.sustainLevel
			}

			// Set the current value and ramp down to silence
			v.env.gain.setValueAtTime(Math.max(0.01, currentGain), now)
			v.env.gain.exponentialRampToValueAtTime(
				0.01,
				now + this.params.env.release,
			)

			// Schedule the oscillators to stop after the release completes
			v.stopAt = now + this.params.env.release + 0.05
		}
	}

	private spawnVoice(freq: number, filterTarget: FilterTarget): VoiceHandle {
		// Safety check for valid frequency
		if (!isFinite(freq) || freq <= 0) {
			console.warn('Invalid frequency:', freq)
			freq = 440 // fallback to A4
		}

		// Poly-unison: N oscillators spread by detune
		const parts: OscillatorNode[] = []
		const det = this.params.detuneSpread
		for (let i = 0; i < this.params.voices; i++) {
			const o = new OscillatorNode(this.ctx, {
				type: this.params.wave,
				frequency: freq,
			})
			const cents =
				this.params.voices === 1
					? 0
					: ((i / (this.params.voices - 1)) * 2 - 1) * det
			o.detune.value = cents
			// vibrato routing
			if (this.params.fx.vibratoOn) this.vibrGain.connect(o.frequency)
			o.start()
			parts.push(o)
		}

		const mix = new GainNode(this.ctx, { gain: 1 / this.params.voices })
		parts.forEach((o) => o.connect(mix))

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
		}
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
							osc.disconnect()
						} catch {
							// Oscillator might already be stopped
						}
					})
					// Disconnect envelope
					voice.env.disconnect()
					this.activeVoices.delete(voice)
				}
			}
		}, 100) // Check every 100ms
	}
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
