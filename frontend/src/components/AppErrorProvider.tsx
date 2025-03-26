"use client"

import { ReactNode } from "react"
import { ErrorBoundary } from "./ErrorBoundary"

interface AppErrorProviderProps {
  children: ReactNode
}

export function AppErrorProvider({ children }: AppErrorProviderProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
} 