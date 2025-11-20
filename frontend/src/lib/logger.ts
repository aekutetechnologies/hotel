type LogLevel = 'info' | 'warn' | 'error'

interface ClientLogPayload {
  level?: LogLevel
  message: string
  module?: string
  context?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export async function logClientEvent(payload: ClientLogPayload) {
  try {
    if (typeof window === 'undefined') {
      return
    }
    
    // Extract module from context or use default
    const module = payload.module || payload.context?.module || 'frontend'
    
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level: payload.level || 'info',
        message: payload.message,
        module: module,
        context: {
          url: window.location.href,
          userAgent: window.navigator.userAgent,
          ...(payload.context || {}),
        },
        metadata: payload.metadata || {},
      }),
    })
  } catch (error) {
    console.error('[client-logger] Failed to send log', error)
  }
}

