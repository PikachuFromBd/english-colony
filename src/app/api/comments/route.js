import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query, getClientIP } from '@/lib/db'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const videoId = parseInt(searchParams.get('videoId'))

        if (!videoId) {
            return NextResponse.json({ comments: [] })
        }

        const comments = await query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.user_id,
        u.name as userName
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.video_id = ?
      ORDER BY c.created_at DESC
      LIMIT 50
    `, [videoId])

        return NextResponse.json({
            comments: comments.map(c => ({
                id: c.id,
                userId: c.user_id,
                user: c.userName,
                text: c.content,
                time: formatTimeAgo(c.created_at)
            }))
        })
    } catch (error) {
        console.error('Get comments error:', error)
        return NextResponse.json({ comments: [] })
    }
}

export async function POST(request) {
    try {
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Please login to comment' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { videoId, content } = body
        const ip = getClientIP(request)

        if (!videoId || !content) {
            return NextResponse.json(
                { message: 'Video ID and content are required' },
                { status: 400 }
            )
        }

        // Add comment
        const result = await query(
            'INSERT INTO comments (user_id, video_id, content, ip_address) VALUES (?, ?, ?, ?)',
            [user.id, videoId, content, ip]
        )

        const newComment = {
            id: result.insertId,
            userId: user.id,
            user: user.name,
            text: content,
            time: 'Just now'
        }

        return NextResponse.json({
            message: 'Comment added successfully',
            comment: newComment
        })

    } catch (error) {
        console.error('Comment error:', error)
        return NextResponse.json(
            { message: 'Failed to add comment. Please try again.' },
            { status: 500 }
        )
    }
}

function formatTimeAgo(date) {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return past.toLocaleDateString()
}
