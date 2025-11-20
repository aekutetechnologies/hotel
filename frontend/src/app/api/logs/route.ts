import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

async function ensureLogDir(): Promise<string> {
  const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd()
  const logDir = path.join(homeDir, 'logs')
  await fs.mkdir(logDir, { recursive: true })
  return logDir
}

function getDateBasedLogFile(logDir: string): string {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return path.join(logDir, `hsquare-frontend-log-${today}.log`)
}

function formatLogEntry(
  timestamp: Date,
  requestMethod: string,
  module: string,
  message: string
): string {
  // Format: time - request type - module - logger message
  const timeStr = timestamp.toISOString().replace('T', ' ').substring(0, 19) // YYYY-MM-DD HH:MM:SS
  return `${timeStr} - ${requestMethod} - ${module} - ${message}\n`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const logDir = await ensureLogDir()
    const logFile = getDateBasedLogFile(logDir)
    
    const timestamp = new Date()
    const requestMethod = request.method || 'POST'
    const module = body?.context?.module || body?.module || 'frontend'
    const message = body?.message || 'Client log entry'
    
    const logLine = formatLogEntry(timestamp, requestMethod, module, message)
    
    await fs.appendFile(logFile, logLine, { encoding: 'utf-8' })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[frontend-log] Failed to write log entry', error)
    return NextResponse.json({ success: false, error: 'Failed to write log' }, { status: 500 })
  }
}

