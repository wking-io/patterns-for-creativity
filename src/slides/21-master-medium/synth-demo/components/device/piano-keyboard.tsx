import { useEffect, useRef, useState } from 'react'
import { cn } from '../../cn'

type PianoKeyboardProps<TVoice> = {
	startMidi?: number
	octaves?: number
	heightClassName?: string
	pressedMidi?: Set<number>
	onNoteOn?: (midi: number) => Promise<TVoice>
	onNoteOff?: (voice: TVoice) => void
}

const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10])

export function DevicePianoKeyboard<TVoice>({
	startMidi = 60,
	octaves = 1,
	heightClassName = 'h-40',
	pressedMidi,
	onNoteOn,
	onNoteOff,
}: PianoKeyboardProps<TVoice>) {
	const keys = Array.from({ length: octaves * 12 }, (_, index) => {
		const midi = startMidi + index
		return { midi, isBlack: BLACK_PITCH_CLASSES.has(midi % 12) }
	})

	return (
		<div className="relative m-4 rounded bg-stone-950 px-1 pb-1">
			<div className={cn('flex overflow-hidden', heightClassName)}>
				{keys.map(({ midi, isBlack }) =>
					isBlack ? (
						<PianoBlackKey
							key={midi}
							midi={midi}
							onNoteOn={onNoteOn}
							onNoteOff={onNoteOff}
							isExternallyPressed={pressedMidi?.has(midi) ?? false}
						/>
					) : (
						<PianoKey
							key={midi}
							midi={midi}
							onNoteOn={onNoteOn}
							onNoteOff={onNoteOff}
							isExternallyPressed={pressedMidi?.has(midi) ?? false}
						/>
					),
				)}
			</div>
			<div className="pointer-events-none absolute inset-0 z-40 bg-gradient-to-b from-stone-950/50 via-stone-950/10 via-10% to-stone-950/0" />
		</div>
	)
}

function PianoKey<TVoice>({
	midi,
	onNoteOn,
	onNoteOff,
	isExternallyPressed,
}: {
	midi: number
	onNoteOn?: (midi: number) => Promise<TVoice>
	onNoteOff?: (voice: TVoice) => void
	isExternallyPressed: boolean
}) {
	const [isMousePressed, setIsMousePressed] = useState(false)
	const voiceRef = useRef<TVoice | null>(null)

	const handlePointerDown = async (event: React.PointerEvent) => {
		if (!onNoteOn || voiceRef.current) return
		event.preventDefault()
		const voice = await onNoteOn(midi)
		voiceRef.current = voice
		setIsMousePressed(true)
	}

	const handlePointerUp = () => {
		if (!onNoteOff || !voiceRef.current) return
		onNoteOff(voiceRef.current)
		voiceRef.current = null
		setIsMousePressed(false)
	}

	useEffect(() => {
		return () => {
			if (voiceRef.current && onNoteOff) {
				onNoteOff(voiceRef.current)
				voiceRef.current = null
			}
		}
	}, [onNoteOff])

	const isPressed = isMousePressed || isExternallyPressed

	return (
		<div
			className={cn(
				'group pointer-events-auto mr-1 flex flex-1 cursor-pointer flex-col last:mr-0',
				isPressed ? 'translate-y-4' : 'translate-y-0',
			)}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerUp}
			onPointerCancel={handlePointerUp}
			aria-label={`Play MIDI note ${midi}`}
		>
			<div className="absolute -top-4 right-0 left-0 h-4 bg-stone-50" />
			<div className="relative z-20 flex-1 rounded-b bg-stone-50" />
			{isPressed && (
				<div className="absolute -top-4 right-0 bottom-6 left-0 z-20 rounded-b bg-gradient-to-b from-stone-300 to-stone-50 to-75%" />
			)}
			<div className="relative z-10 -mt-1 h-2 rounded-b bg-stone-300" />
			<div
				className={cn(
					isPressed
						? 'bg-gradient-to-b from-stone-500 to-stone-200'
						: 'bg-gradient-to-b from-stone-400 to-stone-200',
					'-mt-1 h-6 group-first:rounded-bl-xs group-last:rounded-br-xs',
				)}
			/>
		</div>
	)
}

function PianoBlackKey<TVoice>({
	midi,
	onNoteOn,
	onNoteOff,
	isExternallyPressed,
}: {
	midi: number
	onNoteOn?: (midi: number) => Promise<TVoice>
	onNoteOff?: (voice: TVoice) => void
	isExternallyPressed: boolean
}) {
	const [isMousePressed, setIsMousePressed] = useState(false)
	const voiceRef = useRef<TVoice | null>(null)

	const handlePointerDown = async (event: React.PointerEvent) => {
		if (!onNoteOn || voiceRef.current) return
		event.preventDefault()
		event.stopPropagation()
		const voice = await onNoteOn(midi)
		voiceRef.current = voice
		setIsMousePressed(true)
	}

	const handlePointerUp = () => {
		if (!onNoteOff || !voiceRef.current) return
		onNoteOff(voiceRef.current)
		voiceRef.current = null
		setIsMousePressed(false)
	}

	useEffect(() => {
		return () => {
			if (voiceRef.current && onNoteOff) {
				onNoteOff(voiceRef.current)
				voiceRef.current = null
			}
		}
	}, [onNoteOff])

	const isPressed = isMousePressed || isExternallyPressed

	return (
		<div
			className="pointer-events-auto relative z-30 h-2/3 w-0 cursor-pointer"
			aria-label={`Play MIDI note ${midi}`}
		>
			<div
				className="absolute top-0 h-[calc(100%+4px)] w-10 -translate-x-[22px] rounded-b-sm bg-stone-950 transition-colors"
				onPointerDown={handlePointerDown}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerUp}
				onPointerCancel={handlePointerUp}
			/>
			<div
				className={cn(
					'pointer-events-none h-full w-8 -translate-x-[18px] rounded-b-xs border-x-3 border-r-stone-400 border-b-stone-600 border-l-stone-300 bg-stone-950',
					isPressed ? 'border-b-10' : 'border-b-20',
				)}
			/>
			<div className="pointer-events-none absolute bottom-0 -left-[3.5px] h-4 w-[3px] bg-gradient-to-b from-stone-950/0 via-stone-950/20 via-40% to-stone-950" />
		</div>
	)
}
