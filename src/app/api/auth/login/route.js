import { NextResponse } from 'next/server'
import { comparePassword, generateToken } from '@/lib/auth'
import { dbConnectWithRetry, getClientIP, getUserAgent } from '@/lib/db'
import User from '@/models/User'
import IPTracking from '@/models/IPTracking'
import { logError } from '@/lib/logger'

export async function POST(request) {
    try {
        // Retry database connection if needed (for redeploy scenarios)
        await dbConnectWithRetry(3)

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

        // Find user (include password for check)
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            )
        }

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
        try {
            await IPTracking.create({
                user: user._id,
                ip_address: ip,
                user_agent: userAgent
            })
        } catch (e) {
            // Ignore tracking errors
            console.error('Tracking failed', e)
        }

        // Prepare user data (remove password)
        const userData = {
            id: user._id.toString(), // Mongoose _id is an object
            name: user.name,
            email: user.email,
            profileImage: user.profile_image,
            batchNumber: user.batch_number,
            batchType: user.batch_type,
            contact: user.contact,
            bloodGroup: user.blood_group,
            address: user.address,
            socialLinks: user.social_links || [],
            role: user.role
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
        logError('Login API Error', error)
        return NextResponse.json(
            { message: 'Server error. Please try again.' },
            { status: 500 }
        )
    }
}
