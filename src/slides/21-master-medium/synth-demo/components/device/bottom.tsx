import type { PropsWithChildren } from 'react'

export function DeviceBottom({ children }: PropsWithChildren) {
	return (
		<div className="bg-device-amber-bottom absolute top-full right-4 left-4 z-[-4] mx-auto h-[60px] -translate-y-8 overflow-hidden rounded-t-none rounded-b-xl border-b border-white/50 bg-amber-600 sm:right-0 sm:left-0 dark:border-white/30 dark:bg-amber-700">
			<div className="absolute inset-0 mix-blend-multiply filter-[url(#noise)]" />
			{children}
		</div>
	)
}
