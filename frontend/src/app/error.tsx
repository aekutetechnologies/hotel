"use client"

import { useEffect } from "react"
import { ErrorPage } from "@/components/ErrorPage"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <ErrorPage 
      message={error.message || "Something went wrong. Please try again or contact our support team."} 
      onRetry={reset}
    />
  )
} 