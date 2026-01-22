'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, ChevronDown, ChevronUp, Send, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/Toast'

const videosData = [
    {
        id: 1,
        title: '16th Batch Promo',
        description: 'Amazing promo video from 16th batch students showcasing their creativity and English skills. This video represents the spirit of English Colony - a place where students come together to learn, grow, and have fun while improving their language skills. Watch as our talented students demonstrate their passion for English through creative storytelling and engaging visuals.',
        filename: '16th promo.mp4',
    },
    {
        id: 2,
        title: 'Creative Vision',
        description: 'A unique perspective on what English Colony means to us. This video captures the essence of our community - the friendships, the learning moments, and the memories we create together. Each frame tells a story of growth and connection.',
        filename: 'IMG_0399.MOV',
    },
    {
        id: 3,
        title: 'Our Journey',
        description: 'Capturing the spirit of learning and growth at English Colony. Follow along as we showcase the incredible journey of our members - from shy beginners to confident English speakers. This is what English Colony is all about!',
        filename: 'IMG_3237.MP4',
    },
]

export default function VideoPlayerPage() {
    const params = useParams()
    const videoId = parseInt(params.id)
    const video = videosData.find(v => v.id === videoId) || videosData[0]
    const videoRef = useRef(null)

    const router = useRouter()
    const { showToast } = useToast()
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [voteCount, setVoteCount] = useState(0)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [token, setToken] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [voteLoading, setVoteLoading] = useState(false)

    // Fetch real data from database
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        setToken(storedToken)
        setIsLoggedIn(!!storedToken)

        // Fetch video votes
        fetchVotes(storedToken)

        // Fetch comments from database
        fetchComments()
    }, [videoId])

    const fetchVotes = async (authToken) => {
        try {
            // Get vote count from videos API
            const res = await fetch('/api/videos')
            const data = await res.json()
            const currentVideo = data.videos?.find(v => v.id === videoId)
            if (currentVideo) {
                setVoteCount(currentVideo.votes || 0)
            }

            // Check if user voted
            if (authToken) {
                const votesRes = await fetch('/api/votes', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                })
                const votesData = await votesRes.json()
                setHasVoted(votesData.votes?.includes(videoId))
            }
        } catch (error) {
            console.error('Error fetching votes:', error)
        }
    }

    const fetchComments = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/comments?videoId=${videoId}`)
            const data = await res.json()
            setComments(data.comments || [])
        } catch (error) {
            console.error('Error fetching comments:', error)
            setComments([])
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async () => {
        if (!isLoggedIn) {
            router.push('/login?redirect=/video/' + videoId)
            return
        }

        // Already voted - don't allow
        if (hasVoted) {
            return
        }

        setVoteLoading(true)

        try {
            const res = await fetch('/api/votes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ videoId })
            })

            const data = await res.json()

            if (res.ok) {
                setHasVoted(true)
                setVoteCount(prev => prev + 1)
                showToast('Vote recorded! Thank you!', 'success')
            } else {
                showToast(data.message || 'Failed to vote', 'error')
            }
        } catch (error) {
            showToast('Failed to vote. Please try again.', 'error')
        } finally {
            setVoteLoading(false)
        }
    }

    const handleComment = async (e) => {
        e.preventDefault()
        if (!isLoggedIn) {
            router.push('/login?redirect=/video/' + videoId)
            return
        }

        if (!newComment.trim()) return

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ videoId, content: newComment })
            })

            const data = await res.json()

            if (res.ok) {
                setComments(prev => [data.comment, ...prev])
                setNewComment('')
                showToast('Comment added!', 'success')
            } else {
                showToast(data.message || 'Failed to add comment', 'error')
            }
        } catch (error) {
            showToast('Failed to add comment. Please try again.', 'error')
        }
    }

    const shortDescription = video.description.slice(0, 100) + '...'

    // Get file extension to determine video type
    const getVideoType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase()
        const types = {
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'm4v': 'video/mp4'
        }
        return types[ext] || 'video/mp4'
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Back Button */}
                <div className="px-4 py-3">
                    <Link href="/event" className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary-300 hover:text-primary-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                {/* Video Title */}
                <h1 className="px-4 text-xl font-heading font-bold text-white mb-3">
                    {video.title}
                </h1>

                {/* Video Player */}
                <div className="w-full aspect-video bg-black relative">
                    <video
                        ref={videoRef}
                        controls
                        playsInline
                        controlsList="nodownload"
                        className="w-full h-full object-contain"
                        style={{ backgroundColor: '#000' }}
                    >
                        <source
                            src={`/videos/${video.filename}`}
                            type={getVideoType(video.filename)}
                        />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Description */}
                <div className="px-4 py-4">
                    <div
                        className="glass rounded-xl p-4 cursor-pointer"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                        <p className="text-primary-200/80 text-sm leading-relaxed">
                            {isDescriptionExpanded ? video.description : shortDescription}
                        </p>
                        <button className="flex items-center gap-1 text-primary-400 text-sm mt-2 hover:text-primary-300">
                            {isDescriptionExpanded ? (
                                <>Show less <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Show more <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Vote and Comment Buttons */}
                <div className="px-4 pb-4 flex gap-3">
                    <button
                        onClick={handleVote}
                        disabled={hasVoted || voteLoading}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${hasVoted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-not-allowed'
                            : 'glass hover:bg-primary-600/20'
                            }`}
                    >
                        {voteLoading ? (
                            <div className="spinner w-5 h-5" />
                        ) : (
                            <>
                                <Heart className={`w-5 h-5 ${hasVoted ? 'fill-white' : ''}`} />
                                <span>{voteCount} {hasVoted ? '✓ Voted' : 'Votes'}</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-primary-600/20 transition-all"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>{comments.length} Comments</span>
                    </button>
                </div>

                {/* Comments Section */}
                <div id="comments" className="px-4 pb-8">
                    <h2 className="text-lg font-heading font-semibold text-white mb-4">
                        Comments
                    </h2>

                    {/* Add Comment Form */}
                    <form onSubmit={handleComment} className="mb-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={isLoggedIn ? "Add a comment..." : "Login to comment..."}
                                className="input-field flex-1"
                                disabled={!isLoggedIn}
                            />
                            <button
                                type="submit"
                                className="btn-primary px-4"
                                disabled={!isLoggedIn}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="spinner" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="glass rounded-xl p-6 text-center">
                                <p className="text-primary-400/60">No comments yet. Be the first to comment!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="glass rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        {/* Clickable username linking to profile */}
                                        <Link
                                            href={`/profile/${comment.userId || 1}`}
                                            className="font-medium text-primary-300 hover:text-primary-200 transition-colors"
                                        >
                                            {comment.user}
                                        </Link>
                                        <span className="text-xs text-primary-400/60">{comment.time}</span>
                                    </div>
                                    <p className="text-primary-200/80 text-sm">{comment.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
