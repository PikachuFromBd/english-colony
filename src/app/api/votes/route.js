import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { dbConnect, dbConnectWithRetry, isValidObjectId } from '@/lib/db'
import Vote from '@/models/Vote'
import { logError } from '@/lib/logger'
import mongoose from 'mongoose'

export async function GET(request) {
    try {
        await dbConnect()
        const user = getUserFromRequest(request)

        if (!user) {
            return NextResponse.json({ votes: [] })
        }

        // Validate and convert string ID to ObjectId for Mongoose query
        if (!isValidObjectId(user.id)) {
            console.error('Invalid user ID format:', user.id)
            return NextResponse.json({ votes: [] })
        }

        const userId = new mongoose.Types.ObjectId(user.id)

        // Find videos the user has voted for
        const votes = await Vote.find({ user: userId }).lean()

        return NextResponse.json({
            votes: votes.map(v => v.video_id)
        })

    } catch (error) {
        console.error('Votes check error:', error)
        logError('Votes API GET Error', error)
        return NextResponse.json({ votes: [] })
    }
}

export async function POST(request) {
    try {
        // Retry database connection if needed (critical for vote persistence)
        await dbConnectWithRetry(3)

        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { videoId } = body

        if (!videoId) {
            return NextResponse.json(
                { message: 'Video ID is required' },
                { status: 400 }
            )
        }

        // Validate videoId is a number
        const parsedVideoId = parseInt(videoId)
        if (isNaN(parsedVideoId)) {
            return NextResponse.json(
                { message: 'Invalid video ID' },
                { status: 400 }
            )
        }

        // Validate and convert string ID to ObjectId for Mongoose
        if (!isValidObjectId(user.id)) {
            console.error('Invalid user ID format:', user.id)
            return NextResponse.json(
                { message: 'Invalid user ID format' },
                { status: 400 }
            )
        }

        let userId
        try {
            userId = new mongoose.Types.ObjectId(user.id)
        } catch (idError) {
            console.error('ObjectId creation error:', idError, 'user.id:', user.id)
            return NextResponse.json(
                { message: 'Invalid user ID' },
                { status: 400 }
            )
        }

        // Check if already voted
        const existingVote = await Vote.findOne({
            user: userId,
            video_id: parsedVideoId
        })

        if (existingVote) {
            // Return current vote count even if already voted
            const voteCount = await Vote.countDocuments({ video_id: parsedVideoId })
            return NextResponse.json(
                { 
                    message: 'You have already voted for this video',
                    voteCount: voteCount
                },
                { status: 400 }
            )
        }

        // Create vote with error handling
        let newVote
        try {
            newVote = await Vote.create({
                user: userId,
                video_id: parsedVideoId
            })
        } catch (createError) {
            // Handle duplicate key error (race condition)
            if (createError.code === 11000) {
                const voteCount = await Vote.countDocuments({ video_id: parsedVideoId })
                return NextResponse.json(
                    { 
                        message: 'You have already voted for this video',
                        voteCount: voteCount
                    },
                    { status: 400 }
                )
            }
            throw createError
        }

        // Get updated vote count for this video (with retry for consistency)
        let voteCount
        try {
            voteCount = await Vote.countDocuments({ video_id: parsedVideoId })
        } catch (countError) {
            console.error('Error counting votes:', countError)
            // Still return success since vote was created
            voteCount = 0
        }

        return NextResponse.json({
            message: 'Vote recorded',
            voted: true,
            voteCount: voteCount
        }, { 
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        })

    } catch (error) {
        // Handle duplicate key error explicitly (race conditions)
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'You have already voted for this video' },
                { status: 400 }
            )
        }

        console.error('Vote error:', error)
        logError('Votes API POST Error', error)
        return NextResponse.json(
            { message: 'Failed to vote. Please try again.' },
            { status: 500 }
        )
    }
}
