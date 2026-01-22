import { NextResponse } from 'next/server'
import { comparePassword, generateToken } from '@/lib/auth'
import { query, getClientIP, getUserAgent, trackIP } from '@/lib/db'

export async function POST(request) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Get client info
        const ip = getClientIP(request)
        const userAgent = getUserAgent(request)

        // Find user
        const users = await query('SELECT * FROM users WHERE email = ?', [email])

        if (users.length === 0) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            )
        }

        const user = users[0]

        // Check if blocked
        if (user.is_blocked) {
            return NextResponse.json(
                { message: 'Account has been blocked. Please contact support.' },
                { status: 403 }
            )
        }

        // Verify password
        const isValid = await comparePassword(password, user.password)
        if (!isValid) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Track IP
        await trackIP(user.id, ip, userAgent)

        // Prepare user data (without password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: user.profile_image,
            batchNumber: user.batch_number,
            batchType: user.batch_type,
            contact: user.contact,
            bloodGroup: user.blood_group,
            address: user.address,
            socialLinks: user.social_links ? JSON.parse(user.social_links) : [],
        }

        // Generate token
        const token = generateToken(userData)

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: userData
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { message: 'Server error. Please try again.' },
            { status: 500 }
        )
    }
}
