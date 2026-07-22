import type { PropsWithChildren } from 'react'

export function DeviceFace({ children }: PropsWithChildren) {
	return (
		<div className="relative flex w-full flex-col overflow-hidden rounded-xl bg-amber-400 bg-gradient-to-br from-amber-400 to-amber-500">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-white/10 to-white/0 to-50%" />
			<div className="pointer-events-none absolute inset-0 mix-blend-multiply filter-[url(#noise)]" />
			{children}
			<div className="pointer-events-none absolute inset-0 rounded-xl border-r-2 border-b-2 border-white/20 dark:border-white/10" />
			<div className="pointer-events-none absolute inset-0 rounded-xl border-t-2 border-l-2 border-white/60 dark:border-white/40" />
		</div>
	)
}

export function DeviceFaceSeam() {
	const theme = 'dark'
	return (
		<div className="relative rounded-t-sm border-t border-amber-950/60">
			<div className="flex items-center justify-between rounded-t-sm border-t border-amber-300 font-mono dark:border-amber-500">
				<svg
					width="440"
					height="48"
					className="py-1 pl-2"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<linearGradient
							id="hole-highlight"
							x1="1.5"
							y1="1.5"
							x2="6.5"
							y2="6.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="oklch(37.4% 0.01 67.558)" />
							<stop
								offset="1"
								stopColor={
									theme === 'dark'
										? 'oklch(86.9% 0.005 56.366)'
										: 'oklch(97% 0.001 106.424)'
								}
							/>
						</linearGradient>

						<linearGradient
							id="hole"
							x1="4"
							y1="1"
							x2="4"
							y2="7"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#030712" />
							<stop offset="1" stopColor="#4b5563" />
						</linearGradient>
						<pattern
							id="myPattern"
							patternUnits="userSpaceOnUse"
							width="8"
							height="8"
						>
							<circle cx="4" cy="4" r="3.5" fill="url(#hole-highlight)" />
							<circle cx="4" cy="4" r="3" fill="url(#hole)" />
						</pattern>
					</defs>
					<rect width="8" height="24" fill="url(#myPattern)" />
					<rect width="8" height="32" x="8" fill="url(#myPattern)" />
					<rect width="400" height="40" x="16" fill="url(#myPattern)" />
					<rect width="8" height="32" x="416" fill="url(#myPattern)" />
					<rect width="8" height="24" x="424" fill="url(#myPattern)" />
				</svg>
			</div>
		</div>
	)
}
