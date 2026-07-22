import { forwardRef } from 'react'
import type { PropsWithChildren } from 'react'
import { cn } from '../../cn'

export function DeviceScreen({
	children,
	isOn = false,
	className,
}: PropsWithChildren<{ isOn?: boolean; className?: string }>) {
	return (
		<div className="relative m-4">
			<div className="pointer-events-none absolute top-0 -right-0.5 -bottom-0.5 left-0 rounded-[6px] bg-gradient-to-tl from-white/60 to-white/0" />
			<div className="pointer-events-none absolute -top-0.5 right-0 bottom-0 -left-0.5 rounded-[6px] bg-gradient-to-br from-stone-950/30 to-stone-950/0" />
			<div className="pointer-events-none relative overflow-hidden rounded">
				<div className="pointer-events-none w-full bg-stone-950 p-0.5">
					<div className="bg-glare pointer-events-none absolute inset-0 z-50 rounded-[6px]" />
					<div
						className={cn(
							isOn ? 'scale-y-100' : 'scale-y-0 delay-100',
							'pointer-events-none h-full w-full bg-white/5 transition duration-200',
						)}
					>
						<div
							className={cn(
								isOn ? 'opacity-100 delay-100' : 'opacity-0',
								className,
								'pointer-events-none',
								'relative mx-auto flex w-[calc(100%-calc(var(--spacing)*2))] flex-col overflow-hidden rounded-xs py-1 transition duration-200',
							)}
						>
							{children}
						</div>
					</div>
					<div className="absolute inset-1 rounded border-t-4 border-l-4 border-t-stone-300/15 border-l-stone-300/15"></div>
					<div className="absolute inset-[5px] rounded border-t border-l border-t-stone-200/50 border-l-stone-200/50"></div>
				</div>
			</div>
		</div>
	)
}

export function DeviceTopStatusBar({ children }: PropsWithChildren) {
	return (
		<div className="flex justify-between gap-4 overflow-hidden rounded-t-[10px] border-b border-dashed border-stone-100/60 font-mono text-[10px] text-stone-100/80">
			{children}
		</div>
	)
}

export function DeviceBottomStatusBar({ children }: PropsWithChildren) {
	return (
		<div className="flex gap-4 rounded-b-[11px] border-t border-dashed border-stone-100/60 px-3 py-2 font-mono text-[10px] text-stone-100/80">
			{children}
		</div>
	)
}

export const DeviceCanvas = forwardRef<
	HTMLCanvasElement,
	{ width: number; height: number }
>(({ width, height }, ref) => (
	<div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-stone-950/60">
		<canvas ref={ref} width={width} height={height} />
	</div>
))

DeviceCanvas.displayName = 'DeviceCanvas'
