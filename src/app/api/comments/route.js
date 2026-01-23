import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import Comment from '@/models/Comment'
import User from '@/models/User'
import { logError } from '@/lib/logger'
import mongoose from 'mongoose'

export async function GET(request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const videoId = searchParams.get('videoId')

        if (!videoId) {
            return NextResponse.json({ comments: [] })
        }

        // Fetch comments and populate user details
        const comments = await Comment.find({ video_id: parseInt(videoId) })
            .populate('user', 'name') // Populate name from User model
            .sort({ created_at: -1 }) // Newest first

        // Format for frontend
        const formattedComments = comments.map(c => ({
            id: c._id.toString(),
            text: c.content,
            user: c.user ? c.user.name : 'Unknown User',
            userId: c.user ? c.user._id.toString() : null, // For profile linking
            time: new Date(c.created_at).toLocaleDateString(), // Simple formatting
        }))

        return NextResponse.json({ comments: formattedComments })

    } catch (error) {
        console.error('Comments fetch error:', error)
        logError('Comments API GET Error', error)
        return NextResponse.json({ comments: [] })
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
        const { videoId, content } = body

        if (!videoId || !content) {
            return NextResponse.json(
                { message: 'Video ID and content are required' },
                { status: 400 }
            )
        }

        // Convert string ID to ObjectId for Mongoose
        const userId = new mongoose.Types.ObjectId(user.id)

        // Create comment
        const newComment = await Comment.create({
            user: userId,
            video_id: parseInt(videoId),
            content
        })

        // Populate user details for immediate display
        await newComment.populate('user', 'name')

        return NextResponse.json({
            message: 'Comment added',
            comment: {
                id: newComment._id.toString(),
                text: newComment.content,
                user: newComment.user.name,
                userId: newComment.user._id.toString(),
                time: new Date(newComment.created_at).toLocaleDateString()
            }
        })

    } catch (error) {
        console.error('Comment add error:', error)
        logError('Comments API POST Error', error)
        return NextResponse.json(
            { message: 'Failed to add comment' },
            { status: 500 }
        )
    }
}

export async function DELETE(request) {
    try {
        await dbConnect()
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const commentId = searchParams.get('commentId')

        if (!commentId) {
            return NextResponse.json(
                { message: 'Comment ID is required' },
                { status: 400 }
            )
        }

        // Find the comment
        const comment = await Comment.findById(commentId)

        if (!comment) {
            return NextResponse.json(
                { message: 'Comment not found' },
                { status: 404 }
            )
        }

        // Check if user owns this comment
        if (comment.user.toString() !== user.id) {
            return NextResponse.json(
                { message: 'You can only delete your own comments' },
                { status: 403 }
            )
        }

        // Delete the comment
        await Comment.findByIdAndDelete(commentId)

        return NextResponse.json({
            message: 'Comment deleted successfully'
        })

    } catch (error) {
        console.error('Comment delete error:', error)
        logError('Comments API DELETE Error', error)
        return NextResponse.json(
            { message: 'Failed to delete comment' },
            { status: 500 }
        )
    }
}
