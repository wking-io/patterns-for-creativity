import assert from 'node:assert/strict'
import { isSynthShortcutTypingTarget } from '../src/slides/21-master-medium/synth-demo/keyboard-shortcuts.js'

assert.equal(
	isSynthShortcutTypingTarget({ tagName: 'input', type: 'range' }),
	false,
	'a focused synth slider should not disable the piano shortcuts',
)
assert.equal(
	isSynthShortcutTypingTarget({
		inputMode: 'numeric',
		tagName: 'input',
		type: 'text',
	}),
	false,
	'a focused numeric synth control should not disable letter-note shortcuts',
)
assert.equal(
	isSynthShortcutTypingTarget({ tagName: 'input', type: 'text' }),
	true,
	'a text-entry field should retain normal typing behavior',
)
assert.equal(
	isSynthShortcutTypingTarget({
		readOnly: true,
		tagName: 'input',
		type: 'text',
	}),
	false,
	'a read-only synth display should not disable the piano shortcuts',
)
assert.equal(
	isSynthShortcutTypingTarget({ tagName: 'textarea' }),
	true,
)
assert.equal(
	isSynthShortcutTypingTarget({ isContentEditable: true, tagName: 'div' }),
	true,
)
assert.equal(
	isSynthShortcutTypingTarget({ tagName: 'button' }),
	false,
)

console.log('synth keyboard shortcut tests passed')
