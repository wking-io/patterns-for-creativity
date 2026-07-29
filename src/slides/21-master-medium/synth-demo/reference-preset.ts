import type { SynthWaveform } from './lib/synth'

export type DemoStep = {
	label: string
	notes: number[]
	beats: number
	chordNotes?: number[]
	delayedChordChange?: {
		afterBeats: number
		label: string
		notes: number[]
	}
	gate?: number
	section?: string
	velocity?: number
}

export type DemoPattern = {
	name: string
	description: string
	playOnce?: boolean
	steps: DemoStep[]
}

export type SynthDemoPatch = {
	wave: SynthWaveform
	chordWave: SynthWaveform
	detune: number
	attack: number
	decay: number
	sustain: number
	release: number
	chordAttack: number
	chordDecay: number
	chordSustain: number
	chordRelease: number
	cutoff: number
	chordCutoff: number
	resonance: number
	chordResonance: number
	filterEnvelope: number
	filterDecay: number
	voices: number
	chordVoices: number
	voiceDetune: number
	chordVoiceDetune: number
	stereoWidth: number
	chordStereoWidth: number
	drive: number
	chorusRate: number
	chorusDepthMs: number
	chorusMix: number
	delayMix: number
	reverbMix: number
}

export const REFERENCE_TEMPO = 84

export const REFERENCE_PATCH: SynthDemoPatch = {
	wave: 'sawtooth',
	chordWave: 'triangle',
	detune: 0,
	attack: 0.012,
	decay: 0.09,
	sustain: 0.84,
	release: 0.14,
	chordAttack: 0.055,
	chordDecay: 0.22,
	chordSustain: 0.86,
	chordRelease: 0.35,
	cutoff: 3800,
	chordCutoff: 1250,
	resonance: 0.55,
	chordResonance: 0.45,
	filterEnvelope: 0.07,
	filterDecay: 0.16,
	voices: 3,
	chordVoices: 2,
	voiceDetune: 3.5,
	chordVoiceDetune: 2.5,
	stereoWidth: 0.2,
	chordStereoWidth: 0.42,
	drive: 0,
	chorusRate: 0.18,
	chorusDepthMs: 0.8,
	chorusMix: 0.08,
	delayMix: 0,
	reverbMix: 0.08,
}

/**
 * A sustained diatonic chord bed beneath the reference's single-note lead.
 * The D♯5 is deliberately split by a chord change one beat into its
 * two-beat duration.
 */
export const REFERENCE_PATTERN: DemoPattern = {
	name: 'Tape Bloom',
	description:
		'A sustained chord bed and lead reconstructed from the reference recording.',
	playOnce: true,
	steps: [
		{
			label: 'B4',
			notes: [71],
			beats: 1,
			chordNotes: [64, 68, 71],
			gate: 0.9,
			section: 'E major',
			velocity: 0.9,
		},
		{
			label: 'C#5',
			notes: [73],
			beats: 1,
			gate: 0.9,
			section: 'E major',
			velocity: 0.86,
		},
		{
			label: 'B4',
			notes: [71],
			beats: 1,
			gate: 0.9,
			section: 'E major',
			velocity: 0.86,
		},
		{
			label: 'F#4',
			notes: [66],
			beats: 1,
			gate: 0.9,
			section: 'E major',
			velocity: 0.86,
		},
		{
			label: 'E4',
			notes: [64],
			beats: 1,
			chordNotes: [66, 69, 73],
			gate: 0.9,
			section: 'F# minor',
			velocity: 0.9,
		},
		{
			label: 'F#4',
			notes: [66],
			beats: 1,
			gate: 0.9,
			section: 'F# minor',
			velocity: 0.86,
		},
		{
			label: 'B4',
			notes: [71],
			beats: 1,
			gate: 0.9,
			section: 'F# minor',
			velocity: 0.88,
		},
		{
			label: 'D#5',
			notes: [75],
			beats: 2,
			delayedChordChange: {
				afterBeats: 1,
				label: 'B major',
				notes: [71, 75, 78],
			},
			gate: 0.92,
			section: 'F# minor → B major',
			velocity: 0.92,
		},
		{
			label: 'F#4',
			notes: [66],
			beats: 1,
			gate: 0.9,
			section: 'B major',
			velocity: 0.86,
		},
		{
			label: 'A4',
			notes: [69],
			beats: 1,
			gate: 0.9,
			section: 'B major',
			velocity: 0.88,
		},
		{
			label: 'G#4',
			notes: [68],
			beats: 1,
			gate: 0.9,
			section: 'B major',
			velocity: 0.86,
		},
		{
			label: 'E4',
			notes: [64],
			beats: 4,
			chordNotes: [64, 68, 71],
			gate: 1,
			section: 'E major',
			velocity: 0.92,
		},
	],
}
