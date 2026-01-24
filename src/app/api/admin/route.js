import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import User from '@/models/User'
import Vote from '@/models/Vote'
import Comment from '@/models/Comment' // Assuming you have this model
import mongoose from 'mongoose'

// 🔒 The Secret Key
const ADMIN_KEY = 'asha'

const checkAuth = (req) => {
    const key = req.headers.get('x-admin-key')
    return key === ADMIN_KEY
}

export async function GET(request) {
    if (!checkAuth(request)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    await dbConnect()

    try {
        // Fetch all data for the dashboard
        const users = await User.find({}).sort({ _id: -1 }).limit(50).lean()
        
        // We need to fetch comments safely. If Comment model doesn't exist, return empty.
        let comments = []
        try {
            comments = await Comment.find({}).sort({ createdAt: -1 }).limit(50).lean()
        } catch (e) {
            console.log('Comment model likely missing or empty')
        }

        // Fetch vote counts (we don't need the Video model, just the counts from Vote)
        // We will return hardcoded video IDs 1, 2, 3 since you use those
        const voteCounts = await Vote.aggregate([
            { $group: { _id: '$video_id', count: { $sum: 1 } } }
        ])
        const votesMap = {}
        voteCounts.forEach(v => votesMap[v._id] = v.count)

        const videos = [
            { id: 1, title: '16th Batch Promo', votes: votesMap[1] || 0 },
            { id: 2, title: '18th Batch Promo', votes: votesMap[2] || 0 },
            { id: 3, title: '17th Batch Promo', votes: votesMap[3] || 0 },
        ]

        return NextResponse.json({
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                contact: u.contact || 'N/A',
                batch: u.batch_number ? `${u.batch_number}${u.batch_type || ''}` : 'N/A'
            })),
            comments: comments.map(c => ({
                id: c._id,
                user: c.user_name || 'Unknown',
                text: c.content || '',
                video: c.video_id,
                date: c.createdAt
            })),
            videos
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    if (!checkAuth(request)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    await dbConnect()
    const body = await request.json()

    try {
        // DELETE USER
        if (body.action === 'delete_user') {
            await User.findByIdAndDelete(body.id)
            return NextResponse.json({ success: true })
        }

        // DELETE COMMENT
        if (body.action === 'delete_comment') {
            await Comment.findByIdAndDelete(body.id)
            return NextResponse.json({ success: true })
        }

        // ADJUST VOTE (+1)
        if (body.action === 'add_vote') {
            // Create a "Ghost Vote" with a random User ID
            // This tricks the main site into thinking a new user voted
            await Vote.create({
                user: new mongoose.Types.ObjectId(), // Random ID
                video_id: body.videoId,
                created_at: new Date()
            })
            return NextResponse.json({ success: true })
        }

        // ADJUST VOTE (-1)
        if (body.action === 'remove_vote') {
            // Delete the most recent vote for this video
            const latestVote = await Vote.findOne({ video_id: body.videoId }).sort({ _id: -1 })
            if (latestVote) {
                await Vote.findByIdAndDelete(latestVote._id)
            }
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ message: 'Invalid action' }, { status: 400 })

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
