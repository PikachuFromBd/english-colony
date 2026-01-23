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
        await dbConnect()
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

        // Convert string ID to ObjectId for Mongoose
        const userId = new mongoose.Types.ObjectId(user.id)

        // Check if already voted
        const existingVote = await Vote.findOne({
            user: userId,
            video_id: parseInt(videoId)
        })

        if (existingVote) {
            return NextResponse.json(
                { message: 'You have already voted for this video' },
                { status: 400 }
            )
        }

        // Create vote
        await Vote.create({
            user: userId,
            video_id: parseInt(videoId)
        })

        return NextResponse.json({
            message: 'Vote recorded',
            voted: true
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
            { message: 'Failed to vote' },
            { status: 500 }
        )
    }
}
