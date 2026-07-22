import { useCallback, useEffect, useRef, useState } from 'react'
import Select from './select'
import Slider from './slider'
import { DeviceBody } from './components/device/body'
import { DeviceBottom } from './components/device/bottom'
import { DeviceProvider } from './components/device/context'
import { DeviceFace } from './components/device/face'
import { DevicePianoKeyboard } from './components/device/piano-keyboard'
import { DeviceScreen } from './components/device/screen'
import { DeviceSeam } from './components/device/seam'
import {
	DevicePercentageControl,
	DeviceTimeControl,
} from './components/device/value-control'
import { toFreq } from './lib/music'
import type { VoiceHandle } from './lib/synth'
import { SynthEngine } from './lib/synth'
import { isSynthShortcutTypingTarget } from './keyboard-shortcuts'

type DemoStep = {
	label: string
	notes: number[]
	beats: number
	gate?: number
	section?: string
}

type DemoPattern = {
	name: string
	description: string
	steps: DemoStep[]
}

const DEMO_MOTIFS: DemoPattern[] = [
	{
		name: 'Neon Arp',
		description: 'A bright, climbing arpeggio that exposes motion and detune.',
		steps: [
			{ label: 'C3', notes: [48], beats: 0.5 },
			{ label: 'G3', notes: [55], beats: 0.5 },
			{ label: 'B3', notes: [59], beats: 0.5 },
			{ label: 'E4', notes: [64], beats: 0.5 },
			{ label: 'G4', notes: [67], beats: 0.5 },
			{ label: 'B4', notes: [71], beats: 0.5 },
			{ label: 'G4', notes: [67], beats: 0.5 },
			{ label: 'E4', notes: [64], beats: 0.5 },
			{ label: 'A3', notes: [57], beats: 0.5 },
			{ label: 'E4', notes: [64], beats: 0.5 },
			{ label: 'A4', notes: [69], beats: 0.5 },
			{ label: 'E4', notes: [64], beats: 0.5 },
		],
	},
	{
		name: 'Laser Ladder',
		description: 'A minor-key climb and fall with a sharper, darker edge.',
		steps: [
			{ label: 'C3', notes: [48], beats: 0.5, gate: 0.65 },
			{ label: 'Eb3', notes: [51], beats: 0.5, gate: 0.65 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.65 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.65 },
			{ label: 'Eb4', notes: [63], beats: 0.5, gate: 0.65 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.65 },
			{ label: 'Bb4', notes: [70], beats: 0.5, gate: 0.65 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.65 },
			{ label: 'Eb4', notes: [63], beats: 0.5, gate: 0.65 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.65 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.65 },
			{ label: 'Eb3', notes: [51], beats: 0.5, gate: 0.65 },
		],
	},
	{
		name: 'Prism Cascade',
		description:
			'Wide major-ninth shapes tumble downward in overlapping waves.',
		steps: [
			{ label: 'B4', notes: [71], beats: 0.5, gate: 0.8 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.8 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.8 },
			{ label: 'D4', notes: [62], beats: 0.5, gate: 0.8 },
			{ label: 'B3', notes: [59], beats: 0.5, gate: 0.8 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.8 },
			{ label: 'E3', notes: [52], beats: 0.5, gate: 0.8 },
			{ label: 'B3', notes: [59], beats: 0.5, gate: 0.8 },
			{ label: 'D4', notes: [62], beats: 0.5, gate: 0.8 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.8 },
		],
	},
	{
		name: 'Voltage Bounce',
		description: 'Octave ping-pong with quick rhythmic turns and big movement.',
		steps: [
			{ label: 'C3', notes: [48], beats: 0.5, gate: 0.55 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.55 },
			{ label: 'G3', notes: [55], beats: 0.25, gate: 0.6 },
			{ label: 'G4', notes: [67], beats: 0.75, gate: 0.6 },
			{ label: 'Eb3', notes: [51], beats: 0.5, gate: 0.55 },
			{ label: 'Eb4', notes: [63], beats: 0.5, gate: 0.55 },
			{ label: 'Bb3', notes: [58], beats: 0.25, gate: 0.6 },
			{ label: 'Bb4', notes: [70], beats: 0.75, gate: 0.6 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.55 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.55 },
			{ label: 'D4', notes: [62], beats: 0.5, gate: 0.55 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.55 },
		],
	},
	{
		name: 'Midnight Circuit',
		description:
			'A syncopated minor-seven pattern with breathing room between runs.',
		steps: [
			{ label: 'A3', notes: [57], beats: 0.5, gate: 0.6 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.6 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.6 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.6 },
			{ label: 'B4', notes: [71], beats: 1, gate: 0.45 },
			{ label: 'Rest', notes: [], beats: 0.5 },
			{ label: 'G4', notes: [67], beats: 0.25, gate: 0.6 },
			{ label: 'E4', notes: [64], beats: 0.25, gate: 0.6 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.6 },
			{ label: 'A3', notes: [57], beats: 1, gate: 0.7 },
			{ label: 'Rest', notes: [], beats: 0.5 },
		],
	},
	{
		name: 'Daybreak Dash',
		description: 'Upbeat major-pentatonic skips with a playful arcade lift.',
		steps: [
			{ label: 'C3', notes: [48], beats: 0.5, gate: 0.62 },
			{ label: 'E3', notes: [52], beats: 0.25, gate: 0.62 },
			{ label: 'G3', notes: [55], beats: 0.25, gate: 0.62 },
			{ label: 'A3', notes: [57], beats: 0.5, gate: 0.62 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.62 },
			{ label: 'D4', notes: [62], beats: 0.25, gate: 0.62 },
			{ label: 'E4', notes: [64], beats: 0.25, gate: 0.62 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.62 },
			{ label: 'A4', notes: [69], beats: 0.5, gate: 0.7 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.62 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.62 },
			{ label: 'D4', notes: [62], beats: 0.5, gate: 0.62 },
		],
	},
	{
		name: 'Blue Goodbye',
		description: 'A slow minor descent that feels reflective and unresolved.',
		steps: [
			{ label: 'A4', notes: [69], beats: 1, gate: 0.82 },
			{ label: 'E4', notes: [64], beats: 1, gate: 0.82 },
			{ label: 'C4', notes: [60], beats: 1, gate: 0.82 },
			{ label: 'B3', notes: [59], beats: 0.5, gate: 0.75 },
			{ label: 'A3', notes: [57], beats: 1.5, gate: 0.88 },
			{ label: 'F4', notes: [65], beats: 1, gate: 0.82 },
			{ label: 'C4', notes: [60], beats: 1, gate: 0.82 },
			{ label: 'A3', notes: [57], beats: 1, gate: 0.82 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.75 },
			{ label: 'E3', notes: [52], beats: 1.5, gate: 0.88 },
			{ label: 'Rest', notes: [], beats: 1 },
		],
	},
	{
		name: 'Final Boss',
		description:
			'Phrygian tension, tritones, and relentless mechanical pulses.',
		steps: [
			{ label: 'C3', notes: [48], beats: 0.5, gate: 0.45 },
			{ label: 'Db3', notes: [49], beats: 0.25, gate: 0.55 },
			{ label: 'Gb3', notes: [54], beats: 0.25, gate: 0.55 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.45 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.45 },
			{ label: 'Db4', notes: [61], beats: 0.25, gate: 0.55 },
			{ label: 'Gb4', notes: [66], beats: 0.25, gate: 0.55 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.45 },
			{ label: 'Bb4', notes: [70], beats: 0.25, gate: 0.55 },
			{ label: 'Gb4', notes: [66], beats: 0.25, gate: 0.55 },
			{ label: 'Db4', notes: [61], beats: 0.25, gate: 0.55 },
			{ label: 'G3', notes: [55], beats: 0.25, gate: 0.55 },
			{ label: 'C3', notes: [48], beats: 1, gate: 0.72 },
			{ label: 'Rest', notes: [], beats: 0.5 },
		],
	},
	{
		name: 'Haunted Waltz',
		description: 'A harmonic-minor carousel grouped in eerie three-beat turns.',
		steps: [
			{ label: 'A3', notes: [57], beats: 0.5, gate: 0.78 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.78 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.78 },
			{ label: 'Ab4', notes: [68], beats: 0.5, gate: 0.78 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.78 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.78 },
			{ label: 'F3', notes: [53], beats: 0.5, gate: 0.78 },
			{ label: 'A3', notes: [57], beats: 0.5, gate: 0.78 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.78 },
			{ label: 'F4', notes: [65], beats: 0.5, gate: 0.78 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.78 },
			{ label: 'A3', notes: [57], beats: 0.5, gate: 0.78 },
			{ label: 'E3', notes: [52], beats: 0.5, gate: 0.78 },
			{ label: 'Ab3', notes: [56], beats: 0.5, gate: 0.78 },
			{ label: 'B3', notes: [59], beats: 0.5, gate: 0.78 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.78 },
			{ label: 'B3', notes: [59], beats: 0.5, gate: 0.78 },
			{ label: 'Ab3', notes: [56], beats: 0.5, gate: 0.78 },
		],
	},
	{
		name: 'Zero Gravity',
		description: 'A dreamy whole-tone drift with no clear musical ground.',
		steps: [
			{ label: 'C3', notes: [48], beats: 0.75, gate: 0.92 },
			{ label: 'D3', notes: [50], beats: 0.75, gate: 0.92 },
			{ label: 'E3', notes: [52], beats: 0.75, gate: 0.92 },
			{ label: 'Gb3', notes: [54], beats: 0.75, gate: 0.92 },
			{ label: 'Ab3', notes: [56], beats: 0.75, gate: 0.92 },
			{ label: 'Bb3', notes: [58], beats: 0.75, gate: 0.92 },
			{ label: 'C4', notes: [60], beats: 0.75, gate: 0.92 },
			{ label: 'D4', notes: [62], beats: 0.75, gate: 0.92 },
			{ label: 'E4', notes: [64], beats: 0.75, gate: 0.92 },
			{ label: 'Gb4', notes: [66], beats: 0.75, gate: 0.92 },
			{ label: 'Ab4', notes: [68], beats: 0.75, gate: 0.92 },
			{ label: 'Bb4', notes: [70], beats: 1.5, gate: 0.95 },
			{ label: 'Ab4', notes: [68], beats: 0.75, gate: 0.92 },
			{ label: 'E4', notes: [64], beats: 0.75, gate: 0.92 },
			{ label: 'C4', notes: [60], beats: 0.75, gate: 0.92 },
			{ label: 'Ab3', notes: [56], beats: 0.75, gate: 0.92 },
		],
	},
	{
		name: 'Victory Run',
		description:
			'A triumphant climb built from open fifths and bright major tones.',
		steps: [
			{ label: 'C3', notes: [48], beats: 0.5, gate: 0.7 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.7 },
			{ label: 'C4', notes: [60], beats: 0.5, gate: 0.7 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.7 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.7 },
			{ label: 'B4', notes: [71], beats: 1, gate: 0.82 },
			{ label: 'D3', notes: [50], beats: 0.5, gate: 0.7 },
			{ label: 'A3', notes: [57], beats: 0.5, gate: 0.7 },
			{ label: 'D4', notes: [62], beats: 0.5, gate: 0.7 },
			{ label: 'Gb4', notes: [66], beats: 0.5, gate: 0.7 },
			{ label: 'A4', notes: [69], beats: 1, gate: 0.82 },
			{ label: 'G3', notes: [55], beats: 0.5, gate: 0.7 },
			{ label: 'D4', notes: [62], beats: 0.5, gate: 0.7 },
			{ label: 'G4', notes: [67], beats: 0.5, gate: 0.7 },
			{ label: 'B4', notes: [71], beats: 1.5, gate: 0.86 },
		],
	},
	{
		name: 'Red Alert',
		description: 'A frantic pedal-tone chase that keeps snapping back to home.',
		steps: [
			{ label: 'E3', notes: [52], beats: 0.25, gate: 0.5 },
			{ label: 'B3', notes: [59], beats: 0.25, gate: 0.5 },
			{ label: 'E3', notes: [52], beats: 0.25, gate: 0.5 },
			{ label: 'G3', notes: [55], beats: 0.25, gate: 0.5 },
			{ label: 'E3', notes: [52], beats: 0.25, gate: 0.5 },
			{ label: 'C4', notes: [60], beats: 0.25, gate: 0.5 },
			{ label: 'B3', notes: [59], beats: 0.25, gate: 0.5 },
			{ label: 'Gb3', notes: [54], beats: 0.25, gate: 0.5 },
			{ label: 'E3', notes: [52], beats: 0.25, gate: 0.5 },
			{ label: 'D4', notes: [62], beats: 0.25, gate: 0.5 },
			{ label: 'C4', notes: [60], beats: 0.25, gate: 0.5 },
			{ label: 'B3', notes: [59], beats: 0.25, gate: 0.5 },
			{ label: 'E4', notes: [64], beats: 0.5, gate: 0.62 },
			{ label: 'Rest', notes: [], beats: 0.5 },
		],
	},
]

function fitToKeyboard(midi: number) {
	let fittedMidi = midi
	while (fittedMidi < 48) fittedMidi += 12
	while (fittedMidi > 71) fittedMidi -= 12
	return fittedMidi
}

const NOTE_NAMES = [
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B',
]

function midiLabel(midi: number) {
	return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

function arrangeSection(
	section: string,
	steps: DemoStep[],
	{
		transpose = 0,
		reverse = false,
		beatScale = 1,
		gateScale = 1,
	}: {
		transpose?: number
		reverse?: boolean
		beatScale?: number
		gateScale?: number
	} = {},
) {
	const orderedSteps = reverse ? [...steps].reverse() : steps
	return orderedSteps.map((step) => {
		const notes = step.notes.map((midi) => fitToKeyboard(midi + transpose))
		return {
			...step,
			section,
			label: notes.length ? notes.map(midiLabel).join(' + ') : step.label,
			notes,
			beats: step.beats * beatScale,
			gate: Math.min(0.96, (step.gate ?? 0.72) * gateScale),
		}
	})
}

const DEMO_PATTERNS: DemoPattern[] = DEMO_MOTIFS.map((motif) => ({
	...motif,
	description: `${motif.description} A long-form arrangement with evolving sections.`,
	steps: [
		...arrangeSection('Intro', motif.steps, {
			beatScale: 1.5,
			gateScale: 1.12,
		}),
		...arrangeSection('Verse I', motif.steps),
		...arrangeSection('Verse II', motif.steps, { transpose: 5 }),
		...arrangeSection('Lift', motif.steps, {
			transpose: 2,
			reverse: true,
			beatScale: 0.75,
		}),
		...arrangeSection('Chorus', motif.steps, {
			transpose: 12,
			beatScale: 0.75,
			gateScale: 1.12,
		}),
		...arrangeSection('Break', motif.steps, {
			transpose: -3,
			reverse: true,
			beatScale: 1.25,
			gateScale: 1.18,
		}),
		...arrangeSection('Finale', motif.steps, {
			transpose: 7,
			beatScale: 0.75,
			gateScale: 1.15,
		}),
		...arrangeSection('Outro', motif.steps, {
			reverse: true,
			beatScale: 1.5,
			gateScale: 1.2,
		}),
	],
}))

const DEMO_NAMES = DEMO_PATTERNS.map((pattern) => pattern.name)

const KEYBOARD_SHORTCUTS: Record<string, number> = {
	a: 48,
	w: 49,
	s: 50,
	e: 51,
	d: 52,
	f: 53,
	t: 54,
	g: 55,
	y: 56,
	h: 57,
	u: 58,
	j: 59,
	k: 60,
	o: 61,
	l: 62,
	p: 63,
	';': 64,
}

export default function SynthLearningDevice({
	isInteractive = true,
}: {
	isInteractive?: boolean
}) {
	const audioContextRef = useRef<AudioContext | null>(null)
	const synthRef = useRef<SynthEngine | null>(null)
	const activeVoicesRef = useRef<Map<string, VoiceHandle[]>>(new Map())
	const loopVoicesRef = useRef<VoiceHandle[]>([])
	const [isReady, setIsReady] = useState(false)
	const [audioError, setAudioError] = useState<string | null>(null)
	const [pressedNotes, setPressedNotes] = useState<Set<number>>(new Set())
	const [demoPressedNotes, setDemoPressedNotes] = useState<Set<number>>(
		new Set(),
	)
	const [isLooping, setIsLooping] = useState(false)
	const [selectedDemo, setSelectedDemo] = useState(DEMO_PATTERNS[0].name)
	const [demoTempo, setDemoTempo] = useState(112)
	const [currentDemoStep, setCurrentDemoStep] = useState('Ready')
	const [focusedEnvelopeControl, setFocusedEnvelopeControl] = useState<
		'attack' | 'decay' | 'sustain' | 'release' | null
	>(null)

	const [wave, setWave] = useState<OscillatorType>('sawtooth')
	const [detune, setDetune] = useState(6)
	const [attack, setAttack] = useState(0.02)
	const [decay, setDecay] = useState(0.25)
	const [sustain, setSustain] = useState(0.75)
	const [release, setRelease] = useState(0.6)
	const [cutoff, setCutoff] = useState(3200)
	const [resonance, setResonance] = useState(0.8)
	const [lfoEnabled, setLfoEnabled] = useState(false)
	const [tremoloDepth, setTremoloDepth] = useState(0.3)
	const [tremoloRate, setTremoloRate] = useState(5)
	const [vibratoDepth, setVibratoDepth] = useState(0.25)
	const [voices, setVoices] = useState(4)
	const [voiceDetune, setVoiceDetune] = useState(10)

	useEffect(() => {
		if (!DEMO_NAMES.includes(selectedDemo)) {
			setSelectedDemo(DEMO_NAMES[0])
		}
	}, [selectedDemo])

	const ensureSynth = useCallback(async () => {
		if (!isInteractive) return null
		if (synthRef.current) {
			if (audioContextRef.current?.state === 'suspended') {
				await audioContextRef.current.resume()
			}
			return synthRef.current
		}

		const AudioCtx =
			window.AudioContext ||
			(window as typeof window & { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext
		if (!AudioCtx) {
			setAudioError('Audio unavailable')
			return null
		}
		const context = new AudioCtx({ latencyHint: 'interactive' })
		if (context.state === 'suspended') await context.resume()

		const synth = new SynthEngine(context)
		audioContextRef.current = context
		synthRef.current = synth
		setIsReady(true)
		return synth
	}, [isInteractive])

	useEffect(() => {
		const synth = synthRef.current
		if (!synth) return
		synth.setWave(wave)
		synth.setDetuneSpread(detune + voiceDetune)
		synth.setVoices(voices)
		synth.setAttack(attack)
		synth.params.env.decay = decay
		synth.params.env.sustain = sustain
		synth.setRelease(release)
		synth.setFilterCutoff(cutoff, 'notes')
		synth.setFilterCutoff(cutoff, 'chords')
		synth.setFilterQ(resonance, 'notes')
		synth.setFilterQ(resonance, 'chords')
		synth.params.fx.tremoloRate = tremoloRate
		synth.setMacroA(
			lfoEnabled ? tremoloDepth : 0,
			lfoEnabled ? vibratoDepth : 0,
		)
		synth.applyParams()
	}, [
		attack,
		cutoff,
		decay,
		detune,
		isReady,
		lfoEnabled,
		release,
		resonance,
		sustain,
		tremoloDepth,
		tremoloRate,
		vibratoDepth,
		voiceDetune,
		voices,
		wave,
	])

	const startNote = useCallback(
		async (midi: number, id = `pointer-${midi}`) => {
			if (activeVoicesRef.current.has(id)) return
			const synth = await ensureSynth()
			if (!synth) return
			const noteVoices = synth.noteOn([toFreq(midi)], 'notes')
			activeVoicesRef.current.set(id, noteVoices)
			setPressedNotes((current) => new Set(current).add(midi))
		},
		[ensureSynth],
	)

	const stopNote = useCallback((midi: number, id = `pointer-${midi}`) => {
		const noteVoices = activeVoicesRef.current.get(id)
		if (!noteVoices) return
		synthRef.current?.noteOff(noteVoices)
		activeVoicesRef.current.delete(id)
		setPressedNotes((current) => {
			const next = new Set(current)
			next.delete(midi)
			return next
		})
	}, [])

	const startPointerNote = useCallback(
		async (midi: number): Promise<VoiceHandle[]> => {
			const synth = await ensureSynth()
			return synth?.noteOn([toFreq(midi)], 'notes') ?? []
		},
		[ensureSynth],
	)

	const stopPointerNote = useCallback((noteVoices: VoiceHandle[]) => {
		synthRef.current?.noteOff(noteVoices)
	}, [])

	useEffect(() => {
		if (!isInteractive) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
			const target = event.target
			if (
				target instanceof HTMLElement &&
				isSynthShortcutTypingTarget({
					inputMode: target instanceof HTMLInputElement ? target.inputMode : undefined,
					isContentEditable: target.isContentEditable,
					tagName: target.tagName,
					type: target instanceof HTMLInputElement ? target.type : undefined,
				})
			) return
			const shortcut = event.key.toLowerCase()
			const midi = KEYBOARD_SHORTCUTS[shortcut]
			if (midi === undefined) return
			event.preventDefault()
			event.stopPropagation()
			void startNote(midi, `keyboard-${shortcut}`)
		}
		const onKeyUp = (event: KeyboardEvent) => {
			const shortcut = event.key.toLowerCase()
			const midi = KEYBOARD_SHORTCUTS[shortcut]
			if (midi === undefined) return
			event.preventDefault()
			event.stopPropagation()
			stopNote(midi, `keyboard-${shortcut}`)
		}
		document.addEventListener('keydown', onKeyDown, true)
		document.addEventListener('keyup', onKeyUp, true)
		return () => {
			document.removeEventListener('keydown', onKeyDown, true)
			document.removeEventListener('keyup', onKeyUp, true)
		}
	}, [isInteractive, startNote, stopNote])

	useEffect(() => {
		if (!isInteractive || !isLooping || !synthRef.current) return
		const pattern =
			DEMO_PATTERNS.find((candidate) => candidate.name === selectedDemo) ??
			DEMO_PATTERNS[0]
		const beatDuration = 60_000 / demoTempo
		let stepIndex = 0
		let nextStepTimer: number | undefined
		let releaseTimer: number | undefined

		const playStep = () => {
			const synth = synthRef.current
			if (!synth) return
			if (loopVoicesRef.current.length) synth.noteOff(loopVoicesRef.current)

			const step = pattern.steps[stepIndex]
			const stepDuration = beatDuration * step.beats
			setCurrentDemoStep(
				step.section ? `${step.section} · ${step.label}` : step.label,
			)
			setDemoPressedNotes(
				new Set(step.notes.filter((midi) => midi >= 48 && midi <= 71)),
			)
			window.clearTimeout(releaseTimer)

			if (step.notes.length) {
				const stepVoices = synth.noteOn(
					step.notes.map(toFreq),
					step.notes.length > 1 ? 'chords' : 'notes',
				)
				loopVoicesRef.current = stepVoices
				releaseTimer = window.setTimeout(
					() => {
						synth.noteOff(stepVoices)
						setDemoPressedNotes(new Set())
						if (loopVoicesRef.current === stepVoices) {
							loopVoicesRef.current = []
						}
					},
					stepDuration * (step.gate ?? 0.72),
				)
			} else {
				loopVoicesRef.current = []
			}

			stepIndex = (stepIndex + 1) % pattern.steps.length
			nextStepTimer = window.setTimeout(playStep, stepDuration)
		}

		playStep()
		return () => {
			window.clearTimeout(nextStepTimer)
			window.clearTimeout(releaseTimer)
			setDemoPressedNotes(new Set())
			if (loopVoicesRef.current.length) {
				synthRef.current?.noteOff(loopVoicesRef.current)
				loopVoicesRef.current = []
			}
		}
	}, [demoTempo, isInteractive, isLooping, selectedDemo])

	useEffect(() => {
		return () => {
			activeVoicesRef.current.forEach((noteVoices) =>
				synthRef.current?.noteOff(noteVoices),
			)
			synthRef.current?.destroy()
			void audioContextRef.current?.close()
		}
	}, [])

	const toggleLoop = async () => {
		if (!isInteractive) return
		if (!isLooping && !(await ensureSynth())) return
		setIsLooping((current) => !current)
	}

	const displayedPressedNotes = new Set([...pressedNotes, ...demoPressedNotes])

	return (
		<DeviceProvider>
			<main
				className="pressable overflow-x-clip px-4 pt-8 pb-20 sm:pt-12 sm:pb-24"
				data-synth-interactive={isInteractive ? 'true' : 'false'}
			>
				<DeviceBody className="max-w-6xl px-0 sm:w-full">
					<DeviceFace>
						<DeviceScreen
							isOn={true}
							className="dark font-device text-foreground"
						>
							<div className="pointer-events-auto flex items-center justify-between gap-4 rounded-t-xs border-b border-dashed border-stone-100/20 px-4 py-2">
								<div>
									<p className="text-xs tracking-[0.2em] uppercase">
										Synth Lab
									</p>
									<p className="text-foreground/45 mt-0.5 text-[9px] uppercase">
										Build a sound, then play it below
									</p>
								</div>
								<div className="flex flex-wrap items-center justify-end gap-2 text-[10px] uppercase">
									<span className="text-foreground/50 hidden w-40 truncate text-right sm:inline-block">
										{isLooping ? currentDemoStep : 'A S D F G H J · W E T Y U'}
									</span>
									<Select
										value={selectedDemo}
										onChange={(value) => {
											if (DEMO_NAMES.includes(value)) setSelectedDemo(value)
										}}
										options={DEMO_NAMES}
										className="w-36"
									/>
									<div className="border-foreground/30 bg-layer flex h-6 items-center border">
										<button
											type="button"
											aria-label="Decrease demo tempo"
											onClick={() =>
												setDemoTempo((tempo) => Math.max(60, tempo - 4))
											}
											className="hover:bg-layer-2 h-full border-r border-inherit px-2"
										>
											−
										</button>
										<span className="min-w-16 px-2 text-center tabular-nums">
											{demoTempo} bpm
										</span>
										<button
											type="button"
											aria-label="Increase demo tempo"
											onClick={() =>
												setDemoTempo((tempo) => Math.min(180, tempo + 4))
											}
											className="hover:bg-layer-2 h-full border-l border-inherit px-2"
										>
											+
										</button>
									</div>
									<button
										type="button"
										onClick={() => void toggleLoop()}
										className="border-foreground/30 bg-layer hover:bg-layer-2 border px-3 py-1.5"
									>
										{isLooping ? 'Stop' : 'Play'}
									</button>
									<button
										type="button"
										onClick={() => void ensureSynth()}
										className="border border-amber-500/70 bg-amber-500/10 px-3 py-1.5 text-amber-400"
									>
										{audioError ?? (isReady ? 'Audio on' : 'Power on')}
									</button>
								</div>
							</div>

							<div className="pointer-events-auto grid gap-2 p-2 lg:grid-cols-6">
								<ControlPanel
									title="Oscillator"
									description="Choose the core wave and its pitch spread."
									className="lg:col-span-2"
								>
									<LabeledControl label="Wave shape">
										<Select
											value={wave}
											onChange={(value) => setWave(value as OscillatorType)}
											options={['sine', 'triangle', 'sawtooth', 'square']}
											className="w-full"
										/>
									</LabeledControl>
									<LabeledSlider
										label={`Pitch spread · ${detune.toFixed(1)} cents`}
										value={detune}
										onChange={setDetune}
										min={0}
										max={18}
										step={0.5}
									/>
								</ControlPanel>

								<ControlPanel
									title="Envelope · ADSR"
									description="Shape how every note begins, holds, and fades."
									className="lg:col-span-4"
								>
									<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
										<DeviceTimeControl
											label="Attack"
											value={attack}
											unit="ms"
											updateField={setAttack}
											sensitivity={0.005}
											onFocus={() => setFocusedEnvelopeControl('attack')}
											onBlur={() => setFocusedEnvelopeControl(null)}
											isFocused={focusedEnvelopeControl === 'attack'}
										/>
										<DeviceTimeControl
											label="Decay"
											value={decay}
											unit="ms"
											updateField={setDecay}
											sensitivity={0.005}
											onFocus={() => setFocusedEnvelopeControl('decay')}
											onBlur={() => setFocusedEnvelopeControl(null)}
											isFocused={focusedEnvelopeControl === 'decay'}
										/>
										<DevicePercentageControl
											label="Sustain"
											value={sustain}
											updateField={setSustain}
											onFocus={() => setFocusedEnvelopeControl('sustain')}
											onBlur={() => setFocusedEnvelopeControl(null)}
											isFocused={focusedEnvelopeControl === 'sustain'}
										/>
										<DeviceTimeControl
											label="Release"
											value={release}
											unit="ms"
											updateField={setRelease}
											sensitivity={0.005}
											onFocus={() => setFocusedEnvelopeControl('release')}
											onBlur={() => setFocusedEnvelopeControl(null)}
											isFocused={focusedEnvelopeControl === 'release'}
										/>
									</div>
								</ControlPanel>

								<ControlPanel
									title="Filter"
									description="Sculpt brightness with a low-pass filter."
									className="lg:col-span-2"
								>
									<LabeledSlider
										label={`Cutoff · ${Math.round(cutoff)} Hz`}
										value={cutoff}
										onChange={setCutoff}
										min={200}
										max={8000}
										step={25}
									/>
									<LabeledSlider
										label={`Resonance · ${resonance.toFixed(2)}`}
										value={resonance}
										onChange={setResonance}
										min={0.3}
										max={8}
										step={0.05}
									/>
								</ControlPanel>

								<ControlPanel
									title="LFO"
									description="Add tremolo and vibrato movement."
									className="lg:col-span-2"
									action={
										<button
											type="button"
											aria-pressed={lfoEnabled}
											onClick={() => setLfoEnabled((enabled) => !enabled)}
											className={`min-w-12 border px-2 py-1 text-[9px] uppercase transition-colors ${
												lfoEnabled
													? 'border-amber-500/70 bg-amber-500/15 text-amber-400'
													: 'border-foreground/25 bg-layer text-foreground/50'
											}`}
										>
											{lfoEnabled ? 'On' : 'Off'}
										</button>
									}
								>
									<div className={lfoEnabled ? '' : 'opacity-35'}>
										<LabeledSlider
											label={`Tremolo · ${(tremoloDepth * 100).toFixed(0)}%`}
											value={tremoloDepth}
											onChange={setTremoloDepth}
											min={0}
											max={1}
											step={0.01}
											disabled={!lfoEnabled}
										/>
										<LabeledSlider
											label={`Rate · ${tremoloRate.toFixed(1)} Hz`}
											value={tremoloRate}
											onChange={setTremoloRate}
											min={1}
											max={12}
											step={0.1}
											disabled={!lfoEnabled}
										/>
										<LabeledSlider
											label={`Vibrato · ${(vibratoDepth * 100).toFixed(0)}%`}
											value={vibratoDepth}
											onChange={setVibratoDepth}
											min={0}
											max={1}
											step={0.01}
											disabled={!lfoEnabled}
										/>
									</div>
								</ControlPanel>

								<ControlPanel
									title="Voices"
									description="Stack and detune oscillators for width."
									className="lg:col-span-2"
								>
									<LabeledSlider
										label={`Unison voices · ${voices}`}
										value={voices}
										onChange={setVoices}
										min={1}
										max={7}
										step={1}
									/>
									<LabeledSlider
										label={`Detune · ${voiceDetune.toFixed(1)} cents`}
										value={voiceDetune}
										onChange={setVoiceDetune}
										min={0}
										max={24}
										step={0.5}
									/>
								</ControlPanel>
							</div>
						</DeviceScreen>

						<DevicePianoKeyboard
							startMidi={48}
							octaves={2}
							heightClassName="h-56 sm:h-64"
							pressedMidi={displayedPressedNotes}
							onNoteOn={startPointerNote}
							onNoteOff={stopPointerNote}
						/>
					</DeviceFace>
					<div className="bg-device-amber-bottom pointer-events-none absolute top-full right-px left-px z-[-1] mx-auto h-9 -translate-y-7 overflow-hidden rounded-b-xl bg-amber-600 dark:bg-amber-700">
						<div className="absolute inset-0 mix-blend-multiply filter-[url(#noise)]" />
					</div>
					<DeviceSeam className="z-[-2] -translate-y-[26px] bg-gradient-to-r from-amber-800 via-amber-700 via-10% to-amber-800" />
					<DeviceSeam className="z-[-3] -translate-y-[25px] bg-gradient-to-r from-white/10 via-white/80 via-10% to-white/10 to-50% dark:from-amber-200/10 dark:via-amber-200/60 dark:to-amber-200/10" />
					<DeviceBottom />
				</DeviceBody>
			</main>
		</DeviceProvider>
	)
}

function ControlPanel({
	title,
	description,
	className,
	action,
	children,
}: React.PropsWithChildren<{
	title: string
	description: string
	className?: string
	action?: React.ReactNode
}>) {
	return (
		<section
			className={`border-foreground/10 rounded border bg-stone-800/80 p-3 ${className ?? ''}`}
		>
			<div className="mb-2 flex items-start justify-between gap-2 border-b border-dashed border-stone-100/15 pb-2">
				<div>
					<h2 className="text-[11px] tracking-[0.14em] text-amber-400 uppercase">
						{title}
					</h2>
					<p className="text-foreground/45 mt-1 text-[9px]">{description}</p>
				</div>
				{action}
			</div>
			<div className="grid gap-2">{children}</div>
		</section>
	)
}

function LabeledControl({
	label,
	children,
}: React.PropsWithChildren<{ label: string }>) {
	return (
		<label className="grid gap-1 text-[10px]">
			<span className="text-foreground/65 uppercase">{label}</span>
			{children}
		</label>
	)
}

function LabeledSlider({
	label,
	value,
	onChange,
	min,
	max,
	step,
	disabled = false,
}: {
	label: string
	value: number
	onChange: (value: number) => void
	min: number
	max: number
	step: number
	disabled?: boolean
}) {
	return (
		<LabeledControl label={label}>
			<Slider
				value={value}
				onChange={onChange}
				min={min}
				max={max}
				step={step}
				className="w-full"
				disabled={disabled}
			/>
		</LabeledControl>
	)
}
