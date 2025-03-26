"use client"

import { ErrorPage } from "@/components/ErrorPage"
import { useSearchParams } from "next/navigation"

export default function ErrorRoute() {
  const message = "Something went wrong. Please try again or contact our support team at support@hssquare.com."
  
  return <ErrorPage message={message} />
} 