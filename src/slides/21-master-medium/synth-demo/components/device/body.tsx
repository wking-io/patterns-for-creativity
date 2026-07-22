import type { PropsWithChildren } from 'react'
import { cn } from '../../cn'

export function DeviceBody({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<>
			<svg width="0" height="0">
				<filter id="noise">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="1.2"
						numOctaves="6"
						stitchTiles="stitch"
					/>
					<feColorMatrix type="saturate" values="0" />
					<feComponentTransfer>
						<feFuncR type="gamma" amplitude="1" exponent="0.5" />
						<feFuncG type="gamma" amplitude="1" exponent="0.5" />
						<feFuncB type="gamma" amplitude="1" exponent="0.5" />
						<feFuncA type="linear" slope="0.8" intercept="0.1" />
					</feComponentTransfer>
				</filter>
			</svg>
			<div
				className={cn(
					'relative isolate mx-auto w-full font-mono',
					className ?? 'max-w-115 px-4 sm:w-115 sm:px-0',
				)}
			>
				{children}
				<div className="absolute inset-x-0 top-full z-[-4] h-6 translate-y-[460%] rounded-[50%] bg-amber-950/40 blur-lg" />
				<div className="absolute -inset-x-16 top-full z-[-4] h-16 translate-y-[160%] rounded-[50%] bg-amber-950/40 blur-2xl" />
			</div>
		</>
	)
}
