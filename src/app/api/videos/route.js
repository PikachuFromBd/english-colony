import { NextResponse } from 'next/server'
import { dbConnectWithRetry } from '@/lib/db'
import Video from '@/models/Video'
import Vote from '@/models/Vote'

// ⚠️ CRITICAL: This line forces Vercel to check the DB every single time (No Caching)
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Your Default Data (Will be restored automatically if DB is empty)
const DEFAULT_VIDEOS = [
    {
        id: 1,
        title: '16th Batch Promo',
        description: 'The official promo for the 16th Batch.',
        url: 'https://shahadathassan.cyou/videos/16th%20promo.mp4',
        m3u8Proxy: '/api/hls-proxy?video=16th%20promo',
    },
    {
        id: 2,
        title: '18th Batch Promo',
        description: 'What is going to happen on January 31? 🤯\n\nDirector: Ibtisam Alam Pial...',
        url: 'https://shahadathassan.cyou/videos/IMG_0399.MOV',
        m3u8Proxy: '/api/hls-proxy?video=IMG_0399',
    },
    {
        id: 3,
        title: '17th Batch Promo',
        description: 'This is simply Dramatic... This is innovative.',
        url: 'https://shahadathassan.cyou/videos/IMG_3237.MP4',
        m3u8Proxy: '/api/hls-proxy?video=IMG_3237',
    },
]

export async function GET() {
    try {
        await dbConnectWithRetry(3)

        // 1. AUTO-FIX: Check if videos exist. If not, restore them.
        const count = await Video.countDocuments()
        if (count === 0) {
            console.log('⚠️ Database empty! Restoring default videos...')
            await Video.deleteMany({}) // Safety clean
            await Video.insertMany(DEFAULT_VIDEOS)
        }

        // 2. Fetch Videos (Sorted by ID)
        const videos = await Video.find({}).sort({ id: 1 }).lean()

        // 3. Count Votes (The Reliable Way)
        // We calculate votes one-by-one to ensure total accuracy
        const videosWithVotes = await Promise.all(videos.map(async (video) => {
            // Force database to count real votes for this specific video ID
            const realVoteCount = await Vote.countDocuments({ video_id: video.id })
            
            return {
                ...video,
                votes: realVoteCount || 0
            }
        }))

        return NextResponse.json(
            { videos: videosWithVotes },
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        )

    } catch (error) {
        console.error('API Error:', error)
        // Fallback: If DB crashes, return default list with 0 votes so site doesn't break
        return NextResponse.json({ 
            videos: DEFAULT_VIDEOS.map(v => ({ ...v, votes: 0 })) 
        })
    }
}
