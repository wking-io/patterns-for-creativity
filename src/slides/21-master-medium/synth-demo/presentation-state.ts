import type { SynthWaveform } from './lib/synth.js'

const PRESENTATION_WAVEFORMS = new Set<SynthWaveform>([
	'soft-square',
	'tape-stack',
	'sine',
	'triangle',
	'sawtooth',
	'square',
])

export type SynthPresentationState = {
	wave: SynthWaveform
	detune: number
	attack: number
	decay: number
	sustain: number
	release: number
	cutoff: number
	chordCutoff: number
	resonance: number
	filterEnvelope: number
	lfoEnabled: boolean
	tremoloDepth: number
	tremoloRate: number
	vibratoDepth: number
	voices: number
	voiceDetune: number
	drive: number
	chorusMix: number
	delayMix: number
	reverbMix: number
	selectedDemo: string
	demoTempo: number
	isLooping: boolean
	currentDemoStep: string
	isPowered: boolean
	pressedMidi: number[]
}

export function isSynthPresentationState(
	value: unknown,
): value is SynthPresentationState {
	if (!isRecord(value)) return false

	const wave = value.wave
	const pressedMidi = value.pressedMidi

	return (
		typeof wave === 'string' &&
		PRESENTATION_WAVEFORMS.has(wave as SynthWaveform) &&
		isNumberInRange(value.detune, 0, 18) &&
		isNumberInRange(value.attack, 0, 60) &&
		isNumberInRange(value.decay, 0, 60) &&
		isNumberInRange(value.sustain, 0, 1) &&
		isNumberInRange(value.release, 0, 60) &&
		isNumberInRange(value.cutoff, 200, 8000) &&
		isNumberInRange(value.chordCutoff, 300, 4000) &&
		isNumberInRange(value.resonance, 0.3, 8) &&
		isNumberInRange(value.filterEnvelope, 0, 1) &&
		typeof value.lfoEnabled === 'boolean' &&
		isNumberInRange(value.tremoloDepth, 0, 1) &&
		isNumberInRange(value.tremoloRate, 1, 12) &&
		isNumberInRange(value.vibratoDepth, 0, 1) &&
		isIntegerInRange(value.voices, 1, 7) &&
		isNumberInRange(value.voiceDetune, 0, 24) &&
		isNumberInRange(value.drive, 0, 1) &&
		isNumberInRange(value.chorusMix, 0, 1) &&
		isNumberInRange(value.delayMix, 0, 1) &&
		isNumberInRange(value.reverbMix, 0, 1) &&
		isNonEmptyString(value.selectedDemo) &&
		isIntegerInRange(value.demoTempo, 60, 180) &&
		typeof value.isLooping === 'boolean' &&
		isNonEmptyString(value.currentDemoStep) &&
		typeof value.isPowered === 'boolean' &&
		Array.isArray(pressedMidi) &&
		pressedMidi.every((midi) => isIntegerInRange(midi, 48, 71)) &&
		new Set(pressedMidi).size === pressedMidi.length
	)
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0
}

function isNumberInRange(value: unknown, minimum: number, maximum: number) {
	return (
		typeof value === 'number' &&
		Number.isFinite(value) &&
		value >= minimum &&
		value <= maximum
	)
}

function isIntegerInRange(value: unknown, minimum: number, maximum: number) {
	return Number.isInteger(value) && isNumberInRange(value, minimum, maximum)
}
