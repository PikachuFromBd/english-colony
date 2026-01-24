import { NextResponse } from 'next/server'
import { dbConnect, dbConnectWithRetry } from '@/lib/db'
import Vote from '@/models/Vote'
import { logError } from '@/lib/logger'

export async function GET() {
    try {
        // Use retry for critical vote count endpoint
        await dbConnectWithRetry(3)

        // Aggregate votes by video_id with better error handling
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
            // Fallback to countDocuments if aggregation fails
            const videos = [1, 2, 3]
            voteCounts = await Promise.all(
                videos.map(async (videoId) => ({
                    _id: videoId,
                    count: await Vote.countDocuments({ video_id: videoId }).catch(() => 0)
                }))
            )
        }

        // Convert aggregation result to map for easy lookup
        const voteMap = {}
        voteCounts.forEach(v => {
            voteMap[v._id] = v.count || 0
        })

        // Static video data (Source of Truth)
        const videos = [
            {
                id: 1,
                title: '16th Batch Promo',
                description: '',
                url: 'https://shahadathassan.cyou/videos/16th%20promo.mp4',
                m3u8Url: 'https://shahadathassan.cyou/videos/m3u8/16th%20promo/index.m3u8',
                votes: 0,
            },
            {
                id: 2,
                title: '18th Batch Promo',
                description: `What is going to happen on January 31? 🤯

Director: Ibtisam Alam Pial

Cast:
Rayhan Omi, Ibtisam Alam Pial, Raiyan Noor Talha, Farzana Sultana Khan, Shamsul Arafin Rafi, Shahmita Alam Yeana, Shuvojit Chakroborty, Sadia Tabassum Sriti, Raisul Islam

Cinematography: Ibtisam Alam Pial, Raiyan Noor Talha, Arko Islam Saim
GFX: Shamsul Arafin Rafi
VFX: Ibtisam Alam Pial
Voiceover: Farzana Sultana Khan
Editor: Ibtisam Alam Pial

Special Thanks to Najmul Huda Sir

Presented by: 18th Batch | Department of English | University of Scholars`,
                url: 'https://shahadathassan.cyou/videos/IMG_0399.MOV',
                m3u8Url: 'https://shahadathassan.cyou/videos/m3u8/IMG_0399/index.m3u8',
                votes: 0,
            },
            {
                id: 3,
                title: '17th Batch Promo',
                description: 'This is simply Dramatic... This is innovative.',
                url: 'https://shahadathassan.cyou/videos/IMG_3237.MP4',
                m3u8Url: 'https://shahadathassan.cyou/videos/m3u8/IMG_3237/index.m3u8',
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
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
            }
        })
    } catch (error) {
        console.error('Videos fetch error:', error)
        logError('Videos API GET Error', error)

        // Fallback to static data if DB fails
        const fallbackVideos = [
            { id: 1, title: '16th Batch Promo', url: 'https://shahadathassan.cyou/videos/16th%20promo.mp4', m3u8Url: 'https://shahadathassan.cyou/videos/m3u8/16th%20promo/index.m3u8', votes: 0 },
            { id: 2, title: '18th Batch Promo', url: 'https://shahadathassan.cyou/videos/IMG_0399.MOV', m3u8Url: 'https://shahadathassan.cyou/videos/m3u8/IMG_0399/index.m3u8', votes: 0 },
            { id: 3, title: '17th Batch Promo', url: 'https://shahadathassan.cyou/videos/IMG_3237.MP4', m3u8Url: 'https://shahadathassan.cyou/videos/m3u8/IMG_3237/index.m3u8', votes: 0 },
        ]

        return NextResponse.json({ videos: fallbackVideos })
    }
}
