import { NextResponse } from 'next/server'
import { dbConnectWithRetry } from '@/lib/db'
import Video from '@/models/Video' // New model
import Vote from '@/models/Vote'
import { logError } from '@/lib/logger'

export async function GET() {
    try {
        await dbConnectWithRetry(3)

        // 1. Fetch Video Details from Database (No longer hardcoded!)
        const videos = await Video.find({}).sort({ id: 1 }).lean()

        // 2. Fetch Vote Counts
        let voteCounts = []
        try {
            voteCounts = await Vote.aggregate([
                {
                    $group: {
                        _id: '$video_id',
                        count: { $sum: 1 }
                    }
                }
            ])
        } catch (aggError) {
            console.error('Vote aggregation error:', aggError)
        }

        // 3. Create Vote Map
        const voteMap = {}
        voteCounts.forEach(v => {
            voteMap[v._id] = v.count || 0
        })

        // 4. Merge Details + Votes
        const videosWithVotes = videos.map(video => ({
            ...video,
            // Convert _id to string if needed, or keep 'id' property
            votes: voteMap[video.id] || 0 
        }))

        return NextResponse.json({
            videos: videosWithVotes
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })

    } catch (error) {
        console.error('Videos fetch error:', error)
        logError('Videos API GET Error', error)
        return NextResponse.json({ videos: [] }, { status: 500 })
    }
}
