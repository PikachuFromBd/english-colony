'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, ChevronDown, ChevronUp, Send, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/Toast'

export default function VideoPlayerPage() {
    const params = useParams()
    const router = useRouter()
    const { showToast } = useToast()
    
    // --- STATE MANAGEMENT ---
    const videoId = parseInt(params.id)
    
    // Video Data State
    const [videos, setVideos] = useState([]) 
    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    
    // UI State
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [voteCount, setVoteCount] = useState(0)
    
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [token, setToken] = useState(null)
    const [currentUserId, setCurrentUserId] = useState(null)
    
    // Comments State
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)
    
    // Vote Processing State
    const [voteLoading, setVoteLoading] = useState(false)

    // --- HELPER: JWT PARSER ---
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''))
            return JSON.parse(jsonPayload)
        } catch (e) {
            return null
        }
    }

    // --- HELPER: GENERATE PLAYER URL ---
    // This turns "https://.../videos/16th%20promo.mp4" 
    // into "https://shahadathassan.cyou/player.php?v=16th%20promo"
    const getPlayerSource = (videoUrl) => {
        if (!videoUrl) return ''
        try {
            // 1. Get the last part: "16th%20promo.mp4"
            const filenameWithExt = videoUrl.split('/').pop() 
            // 2. Remove ".mp4" or ".MOV": "16th%20promo"
            const filename = filenameWithExt.split('.').slice(0, -1).join('.') 
            // 3. Return the new player URL
            return `https://shahadathassan.cyou/player.php?v=${filename}`
        } catch (e) {
            console.error('Error parsing video URL', e)
            return ''
        }
    }

    // --- EFFECT: INITIAL DATA FETCH ---
    useEffect(() => {
        const init = async () => {
            const storedToken = localStorage.getItem('token')
            setToken(storedToken)
            setIsLoggedIn(!!storedToken)

            if (storedToken) {
                const decoded = parseJwt(storedToken)
                if (decoded?.id) setCurrentUserId(decoded.id)
            }

            try {
                // 1. Fetch from DB
                const res = await fetch('/api/videos', { cache: 'no-store' })
                const data = await res.json()
                const dbVideos = data.videos || []
                setVideos(dbVideos)

                // 2. Find Current Video
                const currentVideo = dbVideos.find(v => v.id === videoId) || dbVideos[0]
                setVideo(currentVideo)

                if (currentVideo) {
                    setVoteCount(currentVideo.votes || 0)
                }

                // 3. Check User Vote Status
                if (storedToken) {
                    const voteRes = await fetch('/api/votes', {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    })
                    const voteData = await voteRes.json()
                    setHasVoted(voteData.votes?.includes(videoId) || false)
                }

            } catch (error) {
                console.error('Error loading video data:', error)
                showToast('Failed to load video details', 'error')
            } finally {
                setLoading(false)
            }
        }

        init()
        fetchComments()
    }, [videoId]) // eslint-disable-line react-hooks/exhaustive-deps

    // --- API FUNCTIONS ---
    
    const fetchComments = async () => {
        try {
            setCommentLoading(true)
            const res = await fetch(`/api/comments?videoId=${videoId}`)
            const data = await res.json()
            setComments(data.comments || [])
        } catch (error) {
            console.error('Error fetching comments:', error)
        } finally {
            setCommentLoading(false)
        }
    }

    const handleVote = async () => {
        if (!isLoggedIn) {
            router.push('/login?redirect=/video/' + videoId)
            return
        }
        if (hasVoted) return

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
                setVoteCount(data.voteCount)
                setHasVoted(true)
                showToast('Vote recorded!', 'success')
            } else {
                if (data.voteCount) setVoteCount(data.voteCount)
                showToast(data.message || 'Failed to vote', 'error')
            }
        } catch (error) {
            showToast('Failed to vote', 'error')
        } finally {
            setVoteLoading(false)
        }
    }

    const handleComment = async (e) => {
        e.preventDefault()
        if (!isLoggedIn) return router.push('/login?redirect=/video/' + videoId)
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
                showToast(data.message, 'error')
            }
        } catch (error) {
            showToast('Failed to add comment', 'error')
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return
        try {
            const res = await fetch(`/api/comments?commentId=${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId))
                showToast('Comment deleted', 'success')
            }
        } catch (error) {
            showToast('Failed to delete comment', 'error')
        }
    }

    // --- RENDER HELPERS ---
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="spinner w-8 h-8 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!video) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-black">
                <h1 className="text-2xl font-bold mb-4">Video not found</h1>
                <Link href="/event" className="px-4 py-2 bg-primary-600 rounded-lg">Go Back</Link>
            </div>
        )
    }

    const shortDescription = video.description ? video.description.slice(0, 100) + (video.description.length > 100 ? '...' : '') : 'No description available.'

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

                {/* Title */}
                <h1 className="px-4 text-xl font-heading font-bold text-white mb-3">
                    {video.title}
                </h1>

                {/* --- NEW PLAYER (IFRAME) --- */}
                <div className="w-full aspect-video bg-black relative rounded-xl overflow-hidden shadow-lg mx-auto max-w-5xl">
                    <iframe 
                        src={getPlayerSource(video.url)}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={video.title}
                    />
                </div>

                {/* Description */}
                <div className="px-4 py-4">
                    <div
                        className="glass rounded-xl p-4 cursor-pointer"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                        <p className="text-primary-200/80 text-sm leading-relaxed whitespace-pre-line">
                            {isDescriptionExpanded ? video.description : shortDescription}
                        </p>
                        {video.description && video.description.length > 100 && (
                            <button className="flex items-center gap-1 text-primary-400 text-sm mt-2">
                                {isDescriptionExpanded ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Show more</>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Vote & Comment Stats */}
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
                            <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Heart className={`w-5 h-5 ${hasVoted ? 'fill-white' : ''}`} />
                                <span>{voteCount} {hasVoted ? 'Voted' : 'Votes'}</span>
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

                    <div className="space-y-4">
                        {commentLoading ? (
                            <div className="flex justify-center py-4">
                                <div className="spinner w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="glass rounded-xl p-6 text-center">
                                <p className="text-primary-400/60">No comments yet. Be the first!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="glass rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/profile/${comment.userId}`}
                                                className="font-medium text-primary-300 hover:text-primary-200 transition-colors"
                                            >
                                                {comment.user}
                                            </Link>
                                            <span className="text-xs text-primary-400/60">{comment.time}</span>
                                        </div>
                                        {currentUserId && comment.userId === currentUserId && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-primary-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
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
