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
 * For multiple deployments (Vercel + Hostinger), each deployment has its own global scope.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

// Helper to check if ObjectId string is valid
function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id
}

export async function dbConnect() {
  // Always check actual connection state, not just cached reference
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // If connection exists but is not ready, close it first
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close()
    } catch (e) {
      // Ignore close errors
    }
    cached.conn = null
    cached.promise = null
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Reduced for multiple deployments
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      // Important for multiple deployments
      retryWrites: true,
      retryReads: true,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected Successfully')
      logInfo('DB', 'MongoDB Connected Successfully')
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err)
        logError('DB_CONN_ERR', err)
        cached.conn = null
        cached.promise = null
      })

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected')
        cached.conn = null
        cached.promise = null
      })

      return mongoose
    }).catch(err => {
      console.error('MongoDB Connection Error:', err)
      logError('DB_CONN_ERR', err)
      // Reset promise on error so we can retry
      cached.promise = null
      cached.conn = null
      throw err
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    cached.conn = null
    throw e
  }

  return cached.conn
}

// Export helper for ObjectId validation
export { isValidObjectId }

// Helper function for retrying database operations
export async function dbConnectWithRetry(maxRetries = 3) {
  let retries = maxRetries
  while (retries > 0) {
    try {
      await dbConnect()
      return true
    } catch (dbError) {
      retries--
      if (retries === 0) {
        throw dbError
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * (maxRetries - retries)))
    }
  }
  return false
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
