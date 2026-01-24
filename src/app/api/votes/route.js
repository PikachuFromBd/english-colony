import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
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

        // Convert string ID to ObjectId for Mongoose query
        const userId = new mongoose.Types.ObjectId(user.id)

        // Find videos the user has voted for
        const votes = await Vote.find({ user: userId })

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
        // Retry database connection if needed
        let retries = 3
        while (retries > 0) {
            try {
                await dbConnect()
                break
            } catch (dbError) {
                retries--
                if (retries === 0) {
                    throw dbError
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

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

        // Convert string ID to ObjectId for Mongoose
        let userId
        try {
            userId = new mongoose.Types.ObjectId(user.id)
        } catch (idError) {
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

        // Get updated vote count for this video
        const voteCount = await Vote.countDocuments({ video_id: parsedVideoId })

        return NextResponse.json({
            message: 'Vote recorded',
            voted: true,
            voteCount: voteCount
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
