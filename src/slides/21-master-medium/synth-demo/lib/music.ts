// src/music.ts
export const noteNames = [
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
] as const

export const SEMITONES: Record<(typeof noteNames)[number], number> =
	noteNames.reduce(
		(acc, name, index) => {
			acc[name] = index
			return acc
		},
		{} as Record<(typeof noteNames)[number], number>,
	)

export type NoteName = keyof typeof SEMITONES

export function isNoteName(name: string): name is NoteName {
	return Object.keys(SEMITONES).includes(name)
}

export const MODES: Record<string, number[]> = {
	ionian: [0, 2, 4, 5, 7, 9, 11], // major
	aeolian: [0, 2, 3, 5, 7, 8, 10], // natural minor
}

export type ScaleMode = keyof typeof MODES

export function isScaleMode(mode: string): mode is ScaleMode {
	return Object.keys(MODES).includes(mode)
}

export function toFreq(midi: number): number {
	return 440 * Math.pow(2, (midi - 69) / 12)
}

export function rootMidi(root: NoteName, octave = 4): number {
	return 12 * (octave + 1) + SEMITONES[root]
}

export function scaleMidi(
	root: NoteName,
	mode: keyof typeof MODES,
	octave = 4,
): number[] {
	const r = rootMidi(root, octave)
	return MODES[mode].map((s) => r + s)
}

export function midiToNoteName(midi: number): string {
	const noteIndex = midi % 12
	const octave = Math.floor(midi / 12) - 1
	return noteNames[noteIndex] + octave
}

export function chordFromDegree(
	scale: number[],
	degreeIndex: number,
	seventh = false,
): number[] {
	// Build diatonic triad by stacking thirds (scale degrees 1, 3, 5)
	// If a note index goes beyond the scale length, add 12 semitones (one octave)
	const getScaleNote = (i: number): number => {
		const octaveOffset = Math.floor(i / 7) * 12
		const scaleIndex = i % 7
		return scale[scaleIndex] + octaveOffset
	}

	const i = degreeIndex % 7
	const triad = [getScaleNote(i), getScaleNote(i + 2), getScaleNote(i + 4)]
	if (seventh) triad.push(getScaleNote(i + 6))
	return triad
}
