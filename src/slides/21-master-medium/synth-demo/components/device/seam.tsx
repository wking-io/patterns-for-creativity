import type { PropsWithChildren } from 'react'
import { cn } from '../../cn'

export function DeviceSeam({
	className,
	children,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={cn(
				className,
				'pointer-events-none absolute top-full right-[17px] left-[17px] mx-auto h-9 overflow-hidden rounded-t-none rounded-b-xl sm:right-px sm:left-px',
			)}
		>
			<div className="absolute inset-0 mix-blend-multiply filter-[url(#noise)]" />
			{children}
		</div>
	)
}
