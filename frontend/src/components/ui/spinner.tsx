'use client'

import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-solid border-t-transparent border-[#B11E43] h-6 w-6", className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
} 