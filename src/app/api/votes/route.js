import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query, getClientIP } from '@/lib/db'

export async function POST(request) {
    try {
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Please login to vote' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { videoId } = body
        const ip = getClientIP(request)

        if (!videoId) {
            return NextResponse.json(
                { message: 'Video ID is required' },
                { status: 400 }
            )
        }

        // Check if already voted
        const existingVotes = await query(
            'SELECT id FROM votes WHERE user_id = ? AND video_id = ?',
            [user.id, videoId]
        )

        if (existingVotes.length > 0) {
            return NextResponse.json(
                { message: 'You have already voted for this video' },
                { status: 400 }
            )
        }

        // Add vote
        await query(
            'INSERT INTO votes (user_id, video_id, ip_address) VALUES (?, ?, ?)',
            [user.id, videoId, ip]
        )

        // Get new vote count
        const voteCount = await query(
            'SELECT COUNT(*) as count FROM votes WHERE video_id = ?',
            [videoId]
        )

        return NextResponse.json({
            message: 'Vote recorded successfully',
            voted: true,
            voteCount: voteCount[0].count
        })

    } catch (error) {
        console.error('Vote error:', error)
        return NextResponse.json(
            { message: 'Failed to record vote. Please try again.' },
            { status: 500 }
        )
    }
}

export async function GET(request) {
    try {
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ votes: [] })
        }

        const userVotes = await query(
            'SELECT video_id FROM votes WHERE user_id = ?',
            [user.id]
        )

        return NextResponse.json({
            votes: userVotes.map(v => v.video_id)
        })
    } catch (error) {
        console.error('Get votes error:', error)
        return NextResponse.json({ votes: [] })
    }
}
