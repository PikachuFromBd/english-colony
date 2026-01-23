import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Vote from '@/models/Vote'
import { logError } from '@/lib/logger'

export async function GET() {
    try {
        await dbConnect()

        // Aggregate votes by video_id
        const voteCounts = await Vote.aggregate([
            {
                $group: {
                    _id: '$video_id',
                    count: { $sum: 1 }
                }
            }
        ])

        // Convert aggregation result to map for easy lookup
        const voteMap = {}
        voteCounts.forEach(v => {
            voteMap[v._id] = v.count
        })

        // Static video data (Source of Truth)
        const videos = [
            {
                id: 1,
                title: '16th Batch Promo',
                description: 'Amazing promo video from 16th batch students showcasing their creativity and English skills.',
                filename: '16th promo.mp4',
                votes: 0,
            },
            {
                id: 2,
                title: 'Creative Vision',
                description: 'A unique perspective on what English Colony means to us.',
                filename: 'IMG_0399.MOV',
                votes: 0,
            },
            {
                id: 3,
                title: 'Our Journey',
                description: 'Capturing the spirit of learning and growth at English Colony.',
                filename: 'IMG_3237.MP4',
                votes: 0,
            },
        ]

        // Merge votes into static data
        const videosWithVotes = videos.map(video => ({
            ...video,
            votes: voteMap[video.id] || 0
        }))

        return NextResponse.json({
            videos: videosWithVotes
        })
    } catch (error) {
        console.error('Videos fetch error:', error)
        logError('Videos API GET Error', error)

        // Fallback to static data if DB fails
        const fallbackVideos = [
            { id: 1, title: '16th Batch Promo', filename: '16th promo.mp4', votes: 0 },
            { id: 2, title: 'Creative Vision', filename: 'IMG_0399.MOV', votes: 0 },
            { id: 3, title: 'Our Journey', filename: 'IMG_3237.MP4', votes: 0 },
        ]

        return NextResponse.json({ videos: fallbackVideos })
    }
}
