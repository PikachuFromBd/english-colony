import mysql from 'mysql2/promise'

// Parse password handling special characters
const password = process.env.DB_PASSWORD?.replace(/^["']|["']$/g, '') || 'u191858297_english_colony_users#S'

const dbConfig = {
  host: process.env.DB_HOST || 'srv2051.hstgr.io',
  user: process.env.DB_USER || 'u191858297_users',
  password: password,
  database: process.env.DB_NAME || 'u191858297_english_colony',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
}

let pool = null

export async function getConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig)
      // Test connection
      const conn = await pool.getConnection()
      conn.release()
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Database connection error:', error.message)
      pool = null
      throw error
    }
  }
  return pool
}

export async function query(sql, params = []) {
  try {
    const connection = await getConnection()
    const [results] = await connection.execute(sql, params)
    return results
  } catch (error) {
    console.error('Query error:', error.message)
    throw error
  }
}

// Get client IP address
export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')

  if (cfIP) return cfIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP

  return '127.0.0.1'
}

// Get user agent
export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'Unknown'
}

// Check if IP has too many accounts
export async function checkIPLimit(ip, limit = 3) {
  try {
    const result = await query(
      'SELECT COUNT(DISTINCT user_id) as count FROM ip_tracking WHERE ip_address = ?',
      [ip]
    )
    return result[0].count >= limit
  } catch (error) {
    console.error('IP check error:', error.message)
    return false // Allow on error to not block registration
  }
}

// Track IP for user
export async function trackIP(userId, ip, userAgent, fingerprint = null) {
  try {
    await query(
      'INSERT INTO ip_tracking (user_id, ip_address, user_agent, device_fingerprint) VALUES (?, ?, ?, ?)',
      [userId, ip, userAgent, fingerprint]
    )
  } catch (error) {
    console.error('IP tracking error:', error.message)
    // Don't throw - this is not critical
  }
}
