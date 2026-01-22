import { NextResponse } from 'next/server'
import { hashPassword, generateToken } from '@/lib/auth'
import { query, getClientIP, getUserAgent, checkIPLimit, trackIP } from '@/lib/db'

export async function POST(request) {
    try {
        const body = await request.json()
        const { name, email, password } = body

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Name, email, and password are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Get client info
        const ip = getClientIP(request)
        const userAgent = getUserAgent(request)

        // Check IP limit
        const ipLimited = await checkIPLimit(ip)
        if (ipLimited) {
            return NextResponse.json(
                { message: 'Too many accounts from this device. Please contact support.' },
                { status: 403 }
            )
        }

        // Check if user exists
        const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email])
        if (existingUsers.length > 0) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 400 }
            )
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password)

        const result = await query(
            `INSERT INTO users (name, email, password, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, ip, userAgent]
        )

        const userId = result.insertId

        // Track IP
        await trackIP(userId, ip, userAgent)

        // Get created user
        const newUser = {
            id: userId,
            name,
            email,
            profileImage: null,
            batchNumber: null,
            batchType: null,
            contact: null,
            bloodGroup: null,
            address: null,
            socialLinks: [],
        }

        // Generate token
        const token = generateToken(newUser)

        return NextResponse.json({
            message: 'Account created successfully',
            token,
            user: newUser
        })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { message: 'Server error. Please try again.' },
            { status: 500 }
        )
    }
}
