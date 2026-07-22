import { useCallback, useId } from 'react'
import type { PropsWithChildren } from 'react'
import { cn } from './cn'

export default function Select({
	value,
	onChange,
	options,
	className,
}: PropsWithChildren<{
	value: string
	onChange: (value: string) => void
	options: string[]
	className?: string
}>) {
	const id = useId()
	const prevOption = useCallback(() => {
		const index = options.indexOf(value)
		onChange(options[index - 1]! ?? options[options.length - 1]!)
	}, [options, value])
	const nextOption = useCallback(() => {
		const index = options.indexOf(value)
		onChange(options[index + 1]! ?? options[0]!)
	}, [options, value])
	return (
		<div id={id} className={cn('flex', className)}>
			<button
				onClick={prevOption}
				className="border-foreground bg-layer text-foreground hover:bg-layer-2 active:bg-layer-2 flex size-6 items-center justify-center border bg-clip-padding select-none"
			>
				<ChevronIcon className="h-auto w-3 rotate-180" />
			</button>
			<input
				className="border-foreground bg-layer font-code text-foreground focus:outline-brand-green h-6 flex-1 border-x-0 border-t border-b text-center text-xs font-extralight tabular-nums focus:z-1 focus:outline focus:-outline-offset-1"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			<button
				onClick={nextOption}
				className="border-foreground bg-layer text-foreground hover:bg-layer-2 active:bg-layer-2 flex size-6 items-center justify-center border bg-clip-padding select-none"
			>
				<ChevronIcon className="h-auto w-3" />
			</button>
		</div>
	)
}

function ChevronIcon(props: React.ComponentProps<'svg'>) {
	return (
		<svg
			width="16"
			height="15"
			viewBox="0 0 16 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M6 13V12H7V11H8V10H9V9H10V8H11V7H10V6H9V5H8V4H7V3H6V2H5V1H7V2H8V3H9V4H10V5H11V6H12V7H13V8H12V9H11V10H10V11H9V12H8V13H7V14H5V13H6Z"
				fill="currentColor"
			/>
		</svg>
	)
}
