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
import type { SynthWaveform, VoiceHandle } from './lib/synth'
import { SynthEngine } from './lib/synth'
import { isSynthShortcutTypingTarget } from './keyboard-shortcuts'
import {
	REFERENCE_PATCH,
	REFERENCE_PATTERN,
	REFERENCE_TEMPO,
	type DemoPattern,
	type DemoStep,
} from './reference-preset'
import type { SynthPresentationState } from './presentation-state'

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

const DEMO_PATTERNS: DemoPattern[] = [
	REFERENCE_PATTERN,
	...DEMO_MOTIFS.map((motif) => ({
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
	})),
]

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

type PointerNoteHandle = {
	id: string
	isReleased: boolean
	midi: number
	noteVoices: VoiceHandle[]
}

export default function SynthLearningDevice({
	isInteractive = true,
	onPresentationStateChange,
	presentationState,
}: {
	isInteractive?: boolean
	onPresentationStateChange?: (state: SynthPresentationState) => void
	presentationState?: SynthPresentationState
}) {
	const audioContextRef = useRef<AudioContext | null>(null)
	const synthRef = useRef<SynthEngine | null>(null)
	const synthInitializationRef = useRef<Promise<SynthEngine | null> | null>(null)
	const isDisposedRef = useRef(false)
	const activeVoicesRef = useRef<Map<string, VoiceHandle[]>>(new Map())
	const heldNoteSourcesRef = useRef<Map<string, number>>(new Map())
	const loopVoicesRef = useRef<VoiceHandle[]>([])
	const loopChordVoicesRef = useRef<VoiceHandle[]>([])
	const loopChordKeyRef = useRef('')
	const [isReady, setIsReady] = useState(false)
	const [audioError, setAudioError] = useState<string | null>(null)
	const [pressedNotes, setPressedNotes] = useState<Set<number>>(new Set())
	const [demoPressedNotes, setDemoPressedNotes] = useState<Set<number>>(
		new Set(),
	)
	const [demoChordPressedNotes, setDemoChordPressedNotes] = useState<Set<number>>(
		new Set(),
	)
	const [isLooping, setIsLooping] = useState(false)
	const [selectedDemo, setSelectedDemo] = useState(
		presentationState?.selectedDemo ?? DEMO_PATTERNS[0].name,
	)
	const [demoTempo, setDemoTempo] = useState(
		presentationState?.demoTempo ?? REFERENCE_TEMPO,
	)
	const [currentDemoStep, setCurrentDemoStep] = useState('Ready')
	const [focusedEnvelopeControl, setFocusedEnvelopeControl] = useState<
		'attack' | 'decay' | 'sustain' | 'release' | null
	>(null)

	const [wave, setWave] = useState<SynthWaveform>(
		presentationState?.wave ?? REFERENCE_PATCH.wave,
	)
	const [detune, setDetune] = useState(
		presentationState?.detune ?? REFERENCE_PATCH.detune,
	)
	const [attack, setAttack] = useState(
		presentationState?.attack ?? REFERENCE_PATCH.attack,
	)
	const [decay, setDecay] = useState(
		presentationState?.decay ?? REFERENCE_PATCH.decay,
	)
	const [sustain, setSustain] = useState(
		presentationState?.sustain ?? REFERENCE_PATCH.sustain,
	)
	const [release, setRelease] = useState(
		presentationState?.release ?? REFERENCE_PATCH.release,
	)
	const [cutoff, setCutoff] = useState(
		presentationState?.cutoff ?? REFERENCE_PATCH.cutoff,
	)
	const [chordCutoff, setChordCutoff] = useState(
		presentationState?.chordCutoff ?? REFERENCE_PATCH.chordCutoff,
	)
	const [resonance, setResonance] = useState(
		presentationState?.resonance ?? REFERENCE_PATCH.resonance,
	)
	const [filterEnvelope, setFilterEnvelope] = useState(
		presentationState?.filterEnvelope ?? REFERENCE_PATCH.filterEnvelope,
	)
	const [lfoEnabled, setLfoEnabled] = useState(
		presentationState?.lfoEnabled ?? false,
	)
	const [tremoloDepth, setTremoloDepth] = useState(
		presentationState?.tremoloDepth ?? 0.3,
	)
	const [tremoloRate, setTremoloRate] = useState(
		presentationState?.tremoloRate ?? 5,
	)
	const [vibratoDepth, setVibratoDepth] = useState(
		presentationState?.vibratoDepth ?? 0.25,
	)
	const [voices, setVoices] = useState(
		presentationState?.voices ?? REFERENCE_PATCH.voices,
	)
	const [voiceDetune, setVoiceDetune] = useState(
		presentationState?.voiceDetune ?? REFERENCE_PATCH.voiceDetune,
	)
	const [drive, setDrive] = useState(
		presentationState?.drive ?? REFERENCE_PATCH.drive,
	)
	const [chorusMix, setChorusMix] = useState(
		presentationState?.chorusMix ?? REFERENCE_PATCH.chorusMix,
	)
	const [delayMix, setDelayMix] = useState(
		presentationState?.delayMix ?? REFERENCE_PATCH.delayMix,
	)
	const [reverbMix, setReverbMix] = useState(
		presentationState?.reverbMix ?? REFERENCE_PATCH.reverbMix,
	)

	useEffect(() => {
		if (isInteractive || !presentationState) return

		setWave(presentationState.wave)
		setDetune(presentationState.detune)
		setAttack(presentationState.attack)
		setDecay(presentationState.decay)
		setSustain(presentationState.sustain)
		setRelease(presentationState.release)
		setCutoff(presentationState.cutoff)
		setChordCutoff(presentationState.chordCutoff)
		setResonance(presentationState.resonance)
		setFilterEnvelope(presentationState.filterEnvelope)
		setLfoEnabled(presentationState.lfoEnabled)
		setTremoloDepth(presentationState.tremoloDepth)
		setTremoloRate(presentationState.tremoloRate)
		setVibratoDepth(presentationState.vibratoDepth)
		setVoices(presentationState.voices)
		setVoiceDetune(presentationState.voiceDetune)
		setDrive(presentationState.drive)
		setChorusMix(presentationState.chorusMix)
		setDelayMix(presentationState.delayMix)
		setReverbMix(presentationState.reverbMix)
		setSelectedDemo(presentationState.selectedDemo)
		setDemoTempo(presentationState.demoTempo)
		setIsLooping(presentationState.isLooping)
		setCurrentDemoStep(presentationState.currentDemoStep)
		setIsReady(presentationState.isPowered)
	}, [isInteractive, presentationState])

	useEffect(() => {
		if (!isInteractive || !onPresentationStateChange) return

		onPresentationStateChange({
			wave,
			detune,
			attack,
			decay,
			sustain,
			release,
			cutoff,
			chordCutoff,
			resonance,
			filterEnvelope,
			lfoEnabled,
			tremoloDepth,
			tremoloRate,
			vibratoDepth,
			voices,
			voiceDetune,
			drive,
			chorusMix,
			delayMix,
			reverbMix,
			selectedDemo,
			demoTempo,
			isLooping,
			currentDemoStep,
			isPowered: isReady,
			pressedMidi: Array.from(new Set([
				...pressedNotes,
				...demoPressedNotes,
				...demoChordPressedNotes,
			])).sort((left, right) => left - right),
		})
	}, [
		attack,
		chordCutoff,
		chorusMix,
		currentDemoStep,
		cutoff,
		decay,
		delayMix,
		demoChordPressedNotes,
		demoPressedNotes,
		demoTempo,
		detune,
		drive,
		filterEnvelope,
		isInteractive,
		isLooping,
		isReady,
		lfoEnabled,
		onPresentationStateChange,
		pressedNotes,
		release,
		resonance,
		reverbMix,
		selectedDemo,
		sustain,
		tremoloDepth,
		tremoloRate,
		vibratoDepth,
		voiceDetune,
		voices,
		wave,
	])

	useEffect(() => {
		if (!DEMO_NAMES.includes(selectedDemo)) {
			setSelectedDemo(DEMO_NAMES[0])
		}
	}, [selectedDemo])

	const applyControlsToSynth = useCallback((synth: SynthEngine) => {
		synth.setWave(wave, 'notes')
		synth.setWave(REFERENCE_PATCH.chordWave, 'chords')
		synth.setDetuneSpread(detune + voiceDetune, 'notes')
		synth.setDetuneSpread(REFERENCE_PATCH.chordVoiceDetune, 'chords')
		synth.setVoices(voices, 'notes')
		synth.setVoices(REFERENCE_PATCH.chordVoices, 'chords')
		synth.setStereoWidth(REFERENCE_PATCH.stereoWidth, 'notes')
		synth.setStereoWidth(REFERENCE_PATCH.chordStereoWidth, 'chords')
		synth.setDrive(drive)
		synth.setAttack(attack)
		synth.params.env.decay = decay
		synth.params.env.sustain = sustain
		synth.setRelease(release)
		synth.setChordEnvelope({
			attack: REFERENCE_PATCH.chordAttack,
			decay: REFERENCE_PATCH.chordDecay,
			sustain: REFERENCE_PATCH.chordSustain,
			release: REFERENCE_PATCH.chordRelease,
		})
		synth.setFilterCutoff(cutoff, 'notes')
		synth.setFilterCutoff(chordCutoff, 'chords')
		synth.setFilterQ(resonance, 'notes')
		synth.setFilterQ(REFERENCE_PATCH.chordResonance, 'chords')
		synth.setFilterEnvelope(filterEnvelope, REFERENCE_PATCH.filterDecay)
		synth.params.fx.tremoloRate = tremoloRate
		synth.setMacroA(
			lfoEnabled ? tremoloDepth : 0,
			lfoEnabled ? vibratoDepth : 0,
		)
		synth.params.fx.chorusOn = chorusMix > 0
		synth.params.fx.chorusRate = REFERENCE_PATCH.chorusRate
		synth.params.fx.chorusDepthMs = REFERENCE_PATCH.chorusDepthMs
		synth.params.fx.chorusMix = chorusMix
		synth.params.fx.delayOn = delayMix > 0
		synth.params.fx.delayMix = delayMix
		synth.params.fx.reverbOn = reverbMix > 0
		synth.params.fx.reverbMix = reverbMix
		synth.applyParams()
	}, [
		attack,
		chordCutoff,
		chorusMix,
		cutoff,
		decay,
		delayMix,
		detune,
		drive,
		filterEnvelope,
		lfoEnabled,
		release,
		reverbMix,
		resonance,
		sustain,
		tremoloDepth,
		tremoloRate,
		vibratoDepth,
		voiceDetune,
		voices,
		wave,
	])

	const ensureSynth = useCallback((): Promise<SynthEngine | null> => {
		if (!isInteractive) return Promise.resolve(null)
		if (synthRef.current) {
			return (async () => {
				if (audioContextRef.current?.state === 'suspended') {
					await audioContextRef.current.resume()
				}
				return isDisposedRef.current ? null : synthRef.current
			})()
		}

		if (synthInitializationRef.current) {
			return synthInitializationRef.current
		}

		const initialization = (async () => {
			const AudioCtx =
				window.AudioContext ||
				(window as typeof window & {
					webkitAudioContext: typeof AudioContext
				}).webkitAudioContext
			if (!AudioCtx) {
				setAudioError('Audio unavailable')
				return null
			}
			const context = new AudioCtx({ latencyHint: 'interactive' })
			if (context.state === 'suspended') await context.resume()

			if (isDisposedRef.current) {
				await context.close()
				return null
			}

			const synth = new SynthEngine(context)
			applyControlsToSynth(synth)
			audioContextRef.current = context
			synthRef.current = synth
			setIsReady(true)
			return synth
		})()
		synthInitializationRef.current = initialization
		void initialization.then(
			() => {
				if (synthInitializationRef.current === initialization) {
					synthInitializationRef.current = null
				}
			},
			() => {
				if (synthInitializationRef.current === initialization) {
					synthInitializationRef.current = null
				}
			},
		)
		return initialization
	}, [applyControlsToSynth, isInteractive])

	useEffect(() => {
		const synth = synthRef.current
		if (!synth) return
		applyControlsToSynth(synth)
	}, [applyControlsToSynth])

	const holdNoteSource = useCallback((id: string, midi: number) => {
		if (heldNoteSourcesRef.current.has(id)) return false
		heldNoteSourcesRef.current.set(id, midi)
		setPressedNotes(new Set(heldNoteSourcesRef.current.values()))
		return true
	}, [])

	const releaseNoteSource = useCallback((id: string) => {
		if (!heldNoteSourcesRef.current.delete(id)) return
		setPressedNotes(new Set(heldNoteSourcesRef.current.values()))
	}, [])

	const startNote = useCallback(
		async (midi: number, id = `pointer-${midi}`) => {
			if (!holdNoteSource(id, midi)) return
			const synth = await ensureSynth()
			if (!synth || heldNoteSourcesRef.current.get(id) !== midi) return
			const noteVoices = synth.noteOn([toFreq(midi)], 'notes')
			activeVoicesRef.current.set(id, noteVoices)
		},
		[ensureSynth, holdNoteSource],
	)

	const stopNote = useCallback((midi: number, id = `pointer-${midi}`) => {
		releaseNoteSource(id)
		const noteVoices = activeVoicesRef.current.get(id)
		if (!noteVoices) return
		synthRef.current?.noteOff(noteVoices)
		activeVoicesRef.current.delete(id)
	}, [releaseNoteSource])

	const startPointerNote = useCallback(
		async (midi: number): Promise<PointerNoteHandle> => {
			const id = `pointer-${midi}`
			const handle: PointerNoteHandle = {
				id,
				isReleased: false,
				midi,
				noteVoices: [],
			}

			if (holdNoteSource(id, midi)) {
				void ensureSynth().then((synth) => {
					if (
						synth &&
						!handle.isReleased &&
						heldNoteSourcesRef.current.get(id) === midi
					) {
						handle.noteVoices = synth.noteOn([toFreq(midi)], 'notes')
					}
				})
			}

			return handle
		},
		[ensureSynth, holdNoteSource],
	)

	const stopPointerNote = useCallback((handle: PointerNoteHandle) => {
		handle.isReleased = true
		releaseNoteSource(handle.id)
		synthRef.current?.noteOff(handle.noteVoices)
	}, [releaseNoteSource])

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
					readOnly: target instanceof HTMLInputElement ? target.readOnly : undefined,
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
		const releaseKeyboardNotes = () => {
			for (const [shortcut, midi] of Object.entries(KEYBOARD_SHORTCUTS)) {
				stopNote(midi, `keyboard-${shortcut}`)
			}
		}
		const onVisibilityChange = () => {
			if (document.visibilityState === 'hidden') {
				releaseKeyboardNotes()
			}
		}
		document.addEventListener('keydown', onKeyDown, true)
		document.addEventListener('keyup', onKeyUp, true)
		document.addEventListener('visibilitychange', onVisibilityChange)
		window.addEventListener('blur', releaseKeyboardNotes)
		return () => {
			document.removeEventListener('keydown', onKeyDown, true)
			document.removeEventListener('keyup', onKeyUp, true)
			document.removeEventListener('visibilitychange', onVisibilityChange)
			window.removeEventListener('blur', releaseKeyboardNotes)
		}
	}, [isInteractive, startNote, stopNote])

	useEffect(() => {
		if (!isInteractive || !isLooping || !synthRef.current) return
		const synth = synthRef.current
		const pattern =
			DEMO_PATTERNS.find((candidate) => candidate.name === selectedDemo) ??
			DEMO_PATTERNS[0]
		const beatDuration = 60_000 / demoTempo
		let stepIndex = 0
		let nextStepTimer: number | undefined
		let releaseTimer: number | undefined
		let chordChangeTimer: number | undefined

		const changeChord = (notes: number[]) => {
			const chordKey = notes.join(',')
			if (chordKey === loopChordKeyRef.current) return

			if (loopChordVoicesRef.current.length) {
				synthRef.current?.noteOff(loopChordVoicesRef.current)
			}

			loopChordKeyRef.current = chordKey
			loopChordVoicesRef.current = notes.length
				? synth.noteOn(notes.map(toFreq), 'chords', 0.54)
				: []
			setDemoChordPressedNotes(
				new Set(notes.filter((midi) => midi >= 48 && midi <= 71)),
			)
		}

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

			if (step.chordNotes) changeChord(step.chordNotes)
			if (step.delayedChordChange) {
				window.clearTimeout(chordChangeTimer)
				const delayedChordChange = step.delayedChordChange
				chordChangeTimer = window.setTimeout(
					() => changeChord(delayedChordChange.notes),
					beatDuration * delayedChordChange.afterBeats,
				)
			}

			if (step.notes.length) {
				const stepVoices = synth.noteOn(
					step.notes.map(toFreq),
					'notes',
					step.velocity ?? 1,
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

			const isLastStep = stepIndex === pattern.steps.length - 1
			if (isLastStep && pattern.playOnce) {
				nextStepTimer = window.setTimeout(
					() => setIsLooping(false),
					stepDuration,
				)
				return
			}

			stepIndex = (stepIndex + 1) % pattern.steps.length
			nextStepTimer = window.setTimeout(playStep, stepDuration)
		}

		playStep()
		return () => {
			window.clearTimeout(nextStepTimer)
			window.clearTimeout(releaseTimer)
			window.clearTimeout(chordChangeTimer)
			setDemoPressedNotes(new Set())
			setDemoChordPressedNotes(new Set())
			if (loopVoicesRef.current.length) {
				synthRef.current?.noteOff(loopVoicesRef.current)
				loopVoicesRef.current = []
			}
			if (loopChordVoicesRef.current.length) {
				synthRef.current?.noteOff(loopChordVoicesRef.current)
				loopChordVoicesRef.current = []
			}
			loopChordKeyRef.current = ''
		}
	}, [demoTempo, isInteractive, isLooping, selectedDemo])

	useEffect(() => {
		isDisposedRef.current = false
		return () => {
			isDisposedRef.current = true
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

	const displayedPressedNotes = new Set([
		...pressedNotes,
		...demoPressedNotes,
		...demoChordPressedNotes,
		...(!isInteractive ? (presentationState?.pressedMidi ?? []) : []),
	])

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

							<div className="pointer-events-auto grid grid-cols-6 grid-rows-2 gap-2 p-2">
								<ControlPanel
									title="Oscillator"
									description="Choose the lead wave and its pitch spread."
									className="col-span-2"
								>
									<LabeledControl label="Lead wave shape">
										<Select
											value={wave}
											onChange={(value) => setWave(value as SynthWaveform)}
											options={[
												'soft-square',
												'tape-stack',
												'sine',
												'triangle',
												'sawtooth',
												'square',
											]}
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
									<LabeledSlider
										label={`Drive · ${(drive * 100).toFixed(0)}%`}
										value={drive}
										onChange={setDrive}
										min={0}
										max={1}
										step={0.01}
									/>
								</ControlPanel>

								<ControlPanel
									title="Envelope · ADSR"
									description="Shape how each lead note begins, holds, and fades."
									className="col-span-2"
								>
									<div className="grid grid-cols-2 gap-3">
											<DeviceTimeControl
												label="Attack"
												value={attack}
												unit="ms"
												updateField={setAttack}
												sensitivity={0.005}
												max={60}
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
												max={60}
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
												max={60}
											onFocus={() => setFocusedEnvelopeControl('release')}
											onBlur={() => setFocusedEnvelopeControl(null)}
											isFocused={focusedEnvelopeControl === 'release'}
										/>
									</div>
								</ControlPanel>

								<ControlPanel
									title="Filter"
									description="Shape lead presence and chord warmth independently."
									className="col-span-2"
								>
									<div className="grid grid-cols-2 gap-x-3 gap-y-2">
										<LabeledSlider
											label={`Lead cutoff · ${Math.round(cutoff)} Hz`}
											value={cutoff}
											onChange={setCutoff}
											min={200}
											max={8000}
											step={25}
										/>
										<LabeledSlider
											label={`Chord cutoff · ${Math.round(chordCutoff)} Hz`}
											value={chordCutoff}
											onChange={setChordCutoff}
											min={300}
											max={4000}
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
										<LabeledSlider
											label={`Lead envelope · ${(filterEnvelope * 100).toFixed(0)}%`}
											value={filterEnvelope}
											onChange={setFilterEnvelope}
											min={0}
											max={1}
											step={0.01}
										/>
									</div>
								</ControlPanel>

								<ControlPanel
									title="LFO"
									description="Add tremolo and vibrato movement."
									className="col-span-2"
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
									className="col-span-2"
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

								<ControlPanel
									title="Effects"
									description="Add width, echoes, and space."
									className="col-span-2"
								>
									<LabeledSlider
										label={`Chorus · ${(chorusMix * 100).toFixed(0)}%`}
										value={chorusMix}
										onChange={setChorusMix}
										min={0}
										max={1}
										step={0.01}
									/>
									<LabeledSlider
										label={`Delay · ${(delayMix * 100).toFixed(0)}%`}
										value={delayMix}
										onChange={setDelayMix}
										min={0}
										max={1}
										step={0.01}
									/>
									<LabeledSlider
										label={`Reverb · ${(reverbMix * 100).toFixed(0)}%`}
										value={reverbMix}
										onChange={setReverbMix}
										min={0}
										max={1}
										step={0.01}
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
