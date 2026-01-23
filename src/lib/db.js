import mongoose from 'mongoose'
import { logError, logInfo } from './logger'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  // Fallback for build time or error
  console.warn('Please define the MONGODB_URI environment variable')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected Successfully')
      logInfo('DB', 'MongoDB Connected Successfully')
      return mongoose
    }).catch(err => {
      console.error('MongoDB Connection Error:', err)
      logError('DB_CONN_ERR', err)
      throw err
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Helper for client IP (same as before)
export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')

  if (cfIP) return cfIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP

  return '127.0.0.1'
}

export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'Unknown'
}
