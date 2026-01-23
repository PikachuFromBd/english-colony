import { NextResponse } from 'next/server'
import { hashPassword, generateToken } from '@/lib/auth'
import { dbConnect, getClientIP, getUserAgent } from '@/lib/db'
import User from '@/models/User'
import IPTracking from '@/models/IPTracking'
import { logError } from '@/lib/logger'

export async function POST(request) {
    try {
        await dbConnect()
        const body = await request.json()
        const { name, email, password } = body

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Name, email, and password are required' },
                { status: 400 }
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
            role: 'user'
        })

        // Track IP
        const ip = getClientIP(request)
        const userAgent = getUserAgent(request)
        try {
            await IPTracking.create({
                user: newUser._id,
                ip_address: ip,
                user_agent: userAgent
            })
        } catch (e) {
            // ignore
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
