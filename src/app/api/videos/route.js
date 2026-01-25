import { NextResponse } from 'next/server'
import { dbConnectWithRetry } from '@/lib/db'
import Video from '@/models/Video'
import Vote from '@/models/Vote'

// Force dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Updated Video List
const DEFAULT_VIDEOS = [
    {
        id: 1,
        title: '16th Batch Promo',
        description: 'The official promo for the 16th Batch.',
        url: 'https://shahadathassan.cyou/videos/16th%20promo.mp4', 
    },
    {
        id: 2,
        title: '18th Batch Promo',
        description: 'What is going to happen on January 31? 🤯\n\nDirector: Ibtisam Alam Pial...',
        url: 'https://shahadathassan.cyou/videos/IMG_0399.MOV',
    },
    {
        id: 3,
        title: '17th Batch Promo',
        description: 'This is simply Dramatic... This is innovative.',
        url: 'https://shahadathassan.cyou/videos/IMG_3237.MP4',
    },
    {
        id: 4,
        title: '18th Batch Promo (weekend)',
        description: 'This is really out of the box. We traced out a real fan of keka Ferdousi.',
        url: 'https://shahadathassan.cyou/videos/video_2026-01-26_04-16-26.mp4',
    },
]

export async function GET() {
    try {
        await dbConnectWithRetry(3)

        // Auto-Sync: Add missing videos to DB
        for (const video of DEFAULT_VIDEOS) {
            await Video.findOneAndUpdate(
                { id: video.id }, 
                { $set: video }, 
                { upsert: true, new: true }
            )
        }

        // Fetch Videos
        const videos = await Video.find({}).sort({ id: 1 }).lean()

        // Calculate Votes
        const videosWithVotes = await Promise.all(videos.map(async (video) => {
            const realVoteCount = await Vote.countDocuments({ video_id: video.id })
            const totalVotes = (realVoteCount || 0) + (video.manual_votes || 0)
            
            return {
                ...video,
                votes: totalVotes
            }
        }))

        return NextResponse.json(
            { videos: videosWithVotes },
            { 
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache'
                }
            }
        )

    } catch (error) {
        console.error('API Error:', error)
        // Fallback if DB fails
        return NextResponse.json({ 
            videos: DEFAULT_VIDEOS.map(v => ({ ...v, votes: 0 })) 
        })
    }
}
