"use client"

import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled
const CookieConsentClient = dynamic(
  () => import('./CookieConsentClient').then(mod => mod.CookieConsentClient),
  { ssr: false }
)

export function CookieConsentWrapper() {
  return <CookieConsentClient />
} 