import assert from 'node:assert/strict'
import {
	REFERENCE_PATCH,
	REFERENCE_PATTERN,
	REFERENCE_TEMPO,
} from '../src/slides/21-master-medium/synth-demo/reference-preset.js'

assert.equal(REFERENCE_TEMPO, 84)
assert.equal(REFERENCE_PATTERN.steps.length, 12)
assert.equal(REFERENCE_PATTERN.playOnce, true)
assert.equal(
	REFERENCE_PATTERN.steps.reduce((beats, step) => beats + step.beats, 0),
	16,
)
assert.deepEqual(
	REFERENCE_PATTERN.steps.map((step) => step.notes[0]),
	[71, 73, 71, 66, 64, 66, 71, 75, 66, 69, 68, 64],
	'the lead should preserve the reference note order',
)
assert.deepEqual(
	REFERENCE_PATTERN.steps.map((step) => step.beats),
	[1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 4],
	'the D#5 should last two beats and the final E4 should last four beats',
)
assert.deepEqual(
	[
		REFERENCE_PATTERN.steps[0]?.chordNotes,
		REFERENCE_PATTERN.steps[4]?.chordNotes,
		REFERENCE_PATTERN.steps[7]?.delayedChordChange,
		REFERENCE_PATTERN.steps[11]?.chordNotes,
	],
	[
		[64, 68, 71],
		[66, 69, 73],
		{
			afterBeats: 1,
			label: 'B major',
			notes: [71, 75, 78],
		},
		[64, 68, 71],
	],
	'the sustained triads should change at beats 0, 4, 8, and 12',
)
assert.equal(REFERENCE_PATCH.wave, 'sawtooth')
assert.equal(REFERENCE_PATCH.chordWave, 'triangle')
assert.ok(
	REFERENCE_PATCH.chordCutoff < REFERENCE_PATCH.cutoff,
	'the sustained chords should be darker than the lead',
)
assert.equal(REFERENCE_PATCH.drive, 0)
assert.ok(
	REFERENCE_PATCH.filterEnvelope <= 0.08,
	'the lead filter motion should remain subtle',
)
assert.ok(
	REFERENCE_PATCH.chordAttack > REFERENCE_PATCH.attack,
	'chords should fade in more softly than lead notes',
)
assert.ok(
	REFERENCE_PATCH.chordRelease > REFERENCE_PATCH.release,
	'chords should crossfade smoothly while the lead stays articulate',
)
assert.ok(REFERENCE_PATCH.voices > 1)
assert.ok(REFERENCE_PATCH.chordVoices > 1)

console.log('synth reference preset tests passed')
