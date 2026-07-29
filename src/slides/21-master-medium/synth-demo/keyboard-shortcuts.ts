export type SynthShortcutTarget = {
	inputMode?: string
	isContentEditable?: boolean
	readOnly?: boolean
	tagName?: string
	type?: string
}

const nonTypingInputTypes = new Set([
	'button',
	'checkbox',
	'color',
	'date',
	'datetime-local',
	'file',
	'hidden',
	'image',
	'month',
	'number',
	'radio',
	'range',
	'reset',
	'submit',
	'time',
	'week',
])

export function isSynthShortcutTypingTarget(target: SynthShortcutTarget) {
	if (target.isContentEditable) return true

	const tagName = target.tagName?.toUpperCase()
	if (tagName === 'TEXTAREA') return true
	if (tagName !== 'INPUT') return false
	if (target.readOnly) return false

	const inputMode = target.inputMode?.toLowerCase()
	if (inputMode === 'decimal' || inputMode === 'numeric') return false

	return !nonTypingInputTypes.has((target.type ?? 'text').toLowerCase())
}
