import { Slider as BaseSlider } from '@base-ui/react/slider'
import { cn } from './cn'

export default function Slider({
	value,
	onChange,
	min,
	max,
	step,
	className,
	disabled = false,
}: {
	value: number
	onChange: (value: number) => void
	min: number
	max: number
	step: number
	className?: string
	disabled?: boolean
}) {
	return (
		<BaseSlider.Root
			value={value}
			onValueChange={onChange}
			min={min}
			max={max}
			step={step}
			disabled={disabled}
		>
			<BaseSlider.Control
				className={cn(
					'flex touch-none items-center px-5 py-3 select-none',
					className ?? 'w-48',
				)}
			>
				<BaseSlider.Track className="bg-layer shadow-foreground/10 relative flex h-1 w-full shadow-[inset_0_0_0_1px] select-none">
					<p className="text-foreground-muted absolute top-1/2 right-full -mt-px mr-2 -translate-y-1/2 text-xs">
						[-]
					</p>
					<BaseSlider.Indicator className="bg-background/20 select-none" />
					<BaseSlider.Thumb className="bg-layer focus-visible:outline-orange/50 border-foreground size-3 border select-none focus-visible:outline focus-visible:outline-2" />
					<p className="text-foreground-muted absolute top-1/2 left-full -mt-px ml-2 -translate-y-1/2 text-xs">
						[+]
					</p>
				</BaseSlider.Track>
			</BaseSlider.Control>
		</BaseSlider.Root>
	)
}
