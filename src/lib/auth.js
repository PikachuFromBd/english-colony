import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'english-colony-super-secret-key'
const JWT_EXPIRES_IN = '7d'

export function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    )
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

export async function hashPassword(password) {
    return bcrypt.hash(password, 12)
}

export async function comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
}

export function getTokenFromRequest(request) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }
    return null
}

export function getUserFromRequest(request) {
    const token = getTokenFromRequest(request)
    if (!token) return null
    return verifyToken(token)
}
