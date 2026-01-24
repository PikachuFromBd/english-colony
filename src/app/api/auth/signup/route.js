import { NextResponse } from 'next/server'
import { hashPassword, generateToken } from '@/lib/auth'
import { dbConnectWithRetry, getClientIP, getUserAgent } from '@/lib/db'
import User from '@/models/User'
import IPTracking from '@/models/IPTracking'
import { logError } from '@/lib/logger'

// Maximum accounts allowed per IP
const MAX_ACCOUNTS_PER_IP = 2

export async function POST(request) {
    try {
        await dbConnectWithRetry(3)
        const body = await request.json()
        const { name, email, password } = body

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Name, email, and password are required' },
                { status: 400 }
            )
        }

        // Get client info
        const ip = getClientIP(request)
        const userAgent = getUserAgent(request)

        // Check how many accounts exist from this IP
        const existingAccountsFromIP = await IPTracking.countDocuments({ ip_address: ip })

        if (existingAccountsFromIP >= MAX_ACCOUNTS_PER_IP) {
            return NextResponse.json(
                { message: 'Maximum account limit reached from your network. Contact admin if you need assistance.' },
                { status: 403 }
            )
        }

        // Check if user exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 400 }
            )
        }

        // Create user
        const hashedPassword = await hashPassword(password)

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            ip_address: ip,
            user_agent: userAgent,
            role: 'user'
        })

        // Track IP for multi-account prevention
        try {
            await IPTracking.create({
                user: newUser._id,
                ip_address: ip,
                user_agent: userAgent
            })
        } catch (e) {
            // ignore tracking errors
            console.error('IP tracking failed:', e)
        }

        // Prepare response data
        const userData = {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }

        const token = generateToken(userData)

        return NextResponse.json({
            message: 'Account created successfully',
            token,
            user: userData
        }, { status: 201 })

    } catch (error) {
        console.error('Signup error:', error)
        logError('Signup API Error', error)
        return NextResponse.json(
            { message: 'Server error. Please try again.' },
            { status: 500 }
        )
    }
}
