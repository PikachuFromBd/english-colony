import fs from 'fs'
import path from 'path'

// Log file path - standard for many hostings
const LOG_FILE = path.join(process.cwd(), 'app-debug.log')

function getTimestamp() {
    return new Date().toISOString()
}

/**
 * Safely logs error to file without crashing the app
 */
export function logError(context, error) {
    try {
        const timestamp = getTimestamp()
        const errorMessage = error instanceof Error ? error.message : String(error)
        const stack = error instanceof Error ? error.stack : ''

        const logEntry = `
[${timestamp}] [ERROR] [${context}]
Message: ${errorMessage}
Stack: ${stack}
----------------------------------------
`
        // Also log to console for stdout capture
        console.error(logEntry)

        // Try to append to file
        try {
            fs.appendFileSync(LOG_FILE, logEntry)
        } catch (fileErr) {
            console.error('Failed to write to log file:', fileErr.message)
        }
    } catch (e) {
        // Absolute fail-safe
        console.error('Logger failed:', e)
    }
}

export function logInfo(context, message) {
    try {
        const timestamp = getTimestamp()
        const logEntry = `[${timestamp}] [INFO] [${context}] ${message}\n`

        console.log(logEntry)

        try {
            fs.appendFileSync(LOG_FILE, logEntry)
        } catch (fileErr) {
            // Ignore file write errors for info logs
        }
    } catch (e) {
        console.error('Logger failed:', e)
    }
}
