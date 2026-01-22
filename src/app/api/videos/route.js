import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const videos = await query(`
      SELECT 
        v.id,
        v.title,
        v.description,
        v.file_path as filename,
        v.thumbnail_path,
        v.created_at,
        COUNT(vt.id) as votes
      FROM videos v
      LEFT JOIN votes vt ON v.id = vt.video_id
      GROUP BY v.id
      ORDER BY v.id ASC
    `)

        return NextResponse.json({
            videos: videos.map(v => ({
                ...v,
                votes: parseInt(v.votes) || 0
            }))
        })
    } catch (error) {
        console.error('Videos fetch error:', error)

        // Fallback to static data if DB fails
        const fallbackVideos = [
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

        return NextResponse.json({ videos: fallbackVideos })
    }
}
