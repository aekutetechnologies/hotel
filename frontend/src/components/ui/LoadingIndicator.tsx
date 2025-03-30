'use client'

import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

export interface LoadingIndicatorProps {
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

export function LoadingIndicator({
  text,
  variant = 'spinner',
  size = 'md',
  className,
  fullPage = false,
  ...props
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  }

  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    fullPage && 'fixed inset-0 bg-white/80 z-50',
    className
  )

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'spinner':
        return <Spinner className={sizeClasses[size]} />
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className={cn("rounded-full bg-[#B11E43] animate-bounce delay-0", sizeClasses.sm)}></div>
            <div className={cn("rounded-full bg-[#B11E43] animate-bounce delay-75", sizeClasses.sm)}></div>
            <div className={cn("rounded-full bg-[#B11E43] animate-bounce delay-150", sizeClasses.sm)}></div>
          </div>
        )
      case 'pulse':
        return (
          <div className={cn("rounded-full bg-[#B11E43]/80 animate-pulse", sizeClasses[size])}></div>
        )
      case 'skeleton':
        return (
          <div className="space-y-2 w-full max-w-sm">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        )
      default:
        return <Spinner className={sizeClasses[size]} />
    }
  }

  return (
    <div className={containerClasses} {...props}>
      {renderLoadingIndicator()}
      {text && (
        <p className="mt-2 text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  )
} 