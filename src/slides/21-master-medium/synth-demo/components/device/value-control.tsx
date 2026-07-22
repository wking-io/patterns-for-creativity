import { useEffect, useRef, useState } from 'react'

function DeviceValueControl({ children }: React.PropsWithChildren) {
	return <div className="flex flex-col gap-1">{children}</div>
}

function DeviceValueLabel({
	children,
	htmlFor,
}: {
	htmlFor: string
	children: React.ReactNode
}) {
	return (
		<label htmlFor={htmlFor} className="font-device text-foreground/50 text-xs">
			{children}
		</label>
	)
}

type SharedValueControlProps = {
	label: string
	value: number
	updateField: (value: number) => void
	onFocus?: () => void
	onBlur?: () => void
	isFocused?: boolean
}

export function DevicePercentageControl({
	label,
	value,
	updateField,
	onFocus,
	onBlur,
	isFocused,
}: SharedValueControlProps) {
	const [isDragging, setIsDragging] = useState(false)
	const startValueRef = useRef(value)
	const inputRef = useRef<HTMLInputElement>(null)
	const inputId = `${label.toLowerCase()}-percentage-input`

	useEffect(() => {
		if (!isDragging) return

		const handleMouseMove = (event: MouseEvent) => {
			const nextValue = Math.max(
				0,
				Math.min(1, startValueRef.current + event.movementX * 0.01),
			)
			startValueRef.current = nextValue
			updateField(nextValue)
			onFocus?.()
		}

		const handleMouseUp = () => {
			setIsDragging(false)
			if (document.pointerLockElement) document.exitPointerLock()
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, onFocus, updateField])

	const handleMouseDown = (event: React.MouseEvent) => {
		inputRef.current?.focus()
		startValueRef.current = value
		setIsDragging(true)
		void (event.currentTarget as HTMLElement).requestPointerLock()
	}

	return (
		<DeviceValueControl>
			<DeviceValueLabel htmlFor={inputId}>{label}</DeviceValueLabel>
			<div
				className={`border-foreground/10 focus-within:border-primary group/field flex border text-right text-xs select-none ${isFocused ? 'border-primary' : ''}`}
			>
				<input
					ref={inputRef}
					id={inputId}
					type="text"
					inputMode="numeric"
					value={(value * 100).toFixed(0)}
					className="pointer-events-auto inline-block min-w-10 flex-1 px-2 py-1 focus:outline-none"
					onChange={(event) => {
						const nextValue = Number(event.target.value)
						if (Number.isFinite(nextValue)) {
							updateField(Math.max(0, Math.min(100, nextValue)) / 100)
						}
					}}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
				<div
					className={`border-foreground/10 group-focus-within/field:border-primary pointer-events-auto cursor-ew-resize border-l px-2 py-1 group-focus-within/field:bg-amber-500 group-focus-within/field:text-white ${isFocused ? 'border-primary bg-amber-500 text-white' : ''}`}
					onMouseDown={handleMouseDown}
				>
					%
				</div>
			</div>
		</DeviceValueControl>
	)
}

export function DeviceTimeControl({
	label,
	value,
	unit,
	updateField,
	sensitivity = 0.01,
	onFocus,
	onBlur,
	isFocused,
}: SharedValueControlProps & {
	unit: string
	sensitivity?: number
}) {
	const [isDragging, setIsDragging] = useState(false)
	const startValueRef = useRef(value)
	const inputRef = useRef<HTMLInputElement>(null)
	const inputId = `${label.toLowerCase()}-time-input`

	useEffect(() => {
		if (!isDragging) return

		const handleMouseMove = (event: MouseEvent) => {
			const nextValue = Math.max(
				0,
				startValueRef.current + event.movementX * sensitivity,
			)
			startValueRef.current = nextValue
			updateField(nextValue)
			onFocus?.()
		}

		const handleMouseUp = () => {
			setIsDragging(false)
			if (document.pointerLockElement) document.exitPointerLock()
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, onFocus, sensitivity, updateField])

	const handleMouseDown = (event: React.MouseEvent) => {
		inputRef.current?.focus()
		startValueRef.current = value
		setIsDragging(true)
		void (event.currentTarget as HTMLElement).requestPointerLock()
	}

	return (
		<DeviceValueControl>
			<DeviceValueLabel htmlFor={inputId}>{label}</DeviceValueLabel>
			<div
				className={`border-foreground/10 focus-within:border-primary group/field flex border text-right text-xs select-none ${isFocused ? 'border-primary' : ''}`}
			>
				<input
					ref={inputRef}
					id={inputId}
					type="text"
					inputMode="numeric"
					value={(value * (unit === 'ms' ? 1000 : 1)).toFixed(0)}
					className="pointer-events-auto inline-block min-w-10 flex-1 px-2 py-1 focus:outline-none"
					onChange={(event) => {
						const nextValue = Number(event.target.value)
						if (Number.isFinite(nextValue)) {
							updateField(Math.max(0, nextValue) / (unit === 'ms' ? 1000 : 1))
						}
					}}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
				<div
					className={`border-foreground/10 group-focus-within/field:border-primary pointer-events-auto cursor-ew-resize border-l px-2 py-1 group-focus-within/field:bg-amber-500 group-focus-within/field:text-white ${isFocused ? 'border-primary bg-amber-500 text-white' : ''}`}
					onMouseDown={handleMouseDown}
				>
					{unit}
				</div>
			</div>
		</DeviceValueControl>
	)
}
