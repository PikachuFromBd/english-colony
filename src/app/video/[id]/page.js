'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, ChevronDown, ChevronUp, Send, ArrowLeft, Trash2, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/Toast'

const videosData = [
    {
        id: 1,
        title: '16th Batch Promo',
        description: '',
        url: 'https://shahadathassan.cyou/videos/16th%20promo.mp4',
        m3u8Proxy: '/api/hls-proxy?video=16th%20promo',
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

export default function VideoPlayerPage() {
    const params = useParams()
    const videoId = parseInt(params.id)
    const video = videosData.find(v => v.id === videoId) || videosData[0]
    const videoRef = useRef(null)
    const hlsRef = useRef(null)

    const router = useRouter()
    const { showToast } = useToast()
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [voteCount, setVoteCount] = useState(0)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [token, setToken] = useState(null)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [voteLoading, setVoteLoading] = useState(false)
    const [quality, setQuality] = useState('hd') // 'hd' or 'low'
    const [showQualityMenu, setShowQualityMenu] = useState(false)
    const [hlsSupported, setHlsSupported] = useState(false)

    // Parse JWT to get user ID
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))
            return JSON.parse(jsonPayload)
        } catch (e) {
            return null
        }
    }

    // Fetch real data from database
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        setToken(storedToken)
        setIsLoggedIn(!!storedToken)

        if (storedToken) {
            const decoded = parseJwt(storedToken)
            if (decoded && decoded.id) {
                setCurrentUserId(decoded.id)
            }
        }

        // Fetch video votes
        fetchVotes(storedToken)

        // Fetch comments from database
        fetchComments()
    }, [videoId]) // eslint-disable-line react-hooks/exhaustive-deps

    // Initialize video player and check HLS support
    useEffect(() => {
        const videoElement = videoRef.current
        if (!videoElement) return

        // Destroy existing HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }

        const loadVideo = async () => {
            if (quality === 'low') {
                // Dynamic import of HLS.js
                try {
                    const Hls = (await import('hls.js')).default

                    if (Hls.isSupported()) {
                        setHlsSupported(true)
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                        })
                        hlsRef.current = hls
                        hls.loadSource(video.m3u8Proxy)
                        hls.attachMedia(videoElement)

                        hls.on(Hls.Events.ERROR, (event, data) => {
                            console.error('HLS Error:', data)
                            if (data.fatal) {
                                // Fallback to HD on fatal error (like CORS)
                                setQuality('hd')
                                showToast('Low quality unavailable (CORS), using HD', 'info')
                            }
                        })
                    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                        // Native HLS support (Safari)
                        setHlsSupported(true)
                        videoElement.src = video.m3u8Proxy
                    } else {
                        // HLS not supported
                        setHlsSupported(false)
                        setQuality('hd')
                        videoElement.src = video.url
                    }
                } catch (error) {
                    console.error('Failed to load HLS:', error)
                    setQuality('hd')
                    videoElement.src = video.url
                }
            } else {
                // Direct MP4
                videoElement.src = video.url
            }
        }

        loadVideo()

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [quality, video.url, video.m3u8Proxy]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchVotes = async (authToken) => {
        try {
            // Get vote count from videos API with cache busting
            const res = await fetch('/api/videos?' + new URLSearchParams({ 
                _t: Date.now().toString() 
            }), {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            })
            
            if (!res.ok) {
                throw new Error('Failed to fetch votes')
            }
            
            const data = await res.json()
            const currentVideo = data.videos?.find(v => v.id === videoId)
            if (currentVideo) {
                setVoteCount(currentVideo.votes || 0)
            }

            // Check if user voted
            if (authToken) {
                const votesRes = await fetch('/api/votes?' + new URLSearchParams({ 
                    _t: Date.now().toString() 
                }), {
                    headers: { 
                        'Authorization': `Bearer ${authToken}`,
                        'Cache-Control': 'no-cache'
                    },
                    cache: 'no-store'
                })
                
                if (votesRes.ok) {
                    const votesData = await votesRes.json()
                    setHasVoted(votesData.votes?.includes(videoId) || false)
                }
            } else {
                setHasVoted(false)
            }
        } catch (error) {
            console.error('Error fetching votes:', error)
            // Don't update state on error to preserve existing values
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
                // Update vote count from response (this is the source of truth)
                if (data.voteCount !== undefined && data.voteCount !== null) {
                    setVoteCount(data.voteCount)
                } else {
                    // Fallback: increment locally if count not in response
                    setVoteCount(prev => prev + 1)
                }
                // Mark as voted
                setHasVoted(true)
                // Refetch votes from server after a short delay to ensure DB consistency
                setTimeout(async () => {
                    await fetchVotes(token)
                }, 500)
                showToast('Vote recorded! Thank you!', 'success')
            } else {
                // If already voted, update count from response
                if (data.voteCount !== undefined && data.voteCount !== null) {
                    setVoteCount(data.voteCount)
                }
                showToast(data.message || 'Failed to vote', 'error')
            }
        } catch (error) {
            console.error('Vote error:', error)
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
            console.error('Comment error:', error)
            showToast('Failed to add comment. Please try again.', 'error')
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return

        try {
            const res = await fetch(`/api/comments?commentId=${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await res.json()

            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId))
                showToast('Comment deleted!', 'success')
            } else {
                showToast(data.message || 'Failed to delete comment', 'error')
            }
        } catch (error) {
            console.error('Delete comment error:', error)
            showToast('Failed to delete comment. Please try again.', 'error')
        }
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
                        Your browser does not support the video tag.
                    </video>

                    {/* Quality Selector */}
                    <div className="absolute top-3 right-3 z-10">
                        <button
                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm hover:bg-black/90 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            <span>{quality === 'hd' ? 'HD' : 'Low'}</span>
                        </button>

                        {showQualityMenu && (
                            <div className="absolute top-full right-0 mt-1 bg-black/90 rounded-lg overflow-hidden min-w-[100px]">
                                <button
                                    onClick={() => { setQuality('hd'); setShowQualityMenu(false) }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${quality === 'hd' ? 'text-primary-400' : 'text-white'}`}
                                >
                                    HD (Original)
                                </button>
                                <button
                                    onClick={() => { setQuality('low'); setShowQualityMenu(false) }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${quality === 'low' ? 'text-primary-400' : 'text-white'}`}
                                    title={!hlsSupported ? 'Low quality requires CORS headers on server' : ''}
                                >
                                    Low (Faster)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="px-4 py-4">
                    <div
                        className="glass rounded-xl p-4 cursor-pointer"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                        <p className="text-primary-200/80 text-sm leading-relaxed whitespace-pre-line">
                            {isDescriptionExpanded ? video.description || 'No description available.' : shortDescription}
                        </p>
                        {video.description && video.description.length > 100 && (
                            <button className="flex items-center gap-1 text-primary-400 text-sm mt-2 hover:text-primary-300">
                                {isDescriptionExpanded ? (
                                    <>Show less <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                    <>Show more <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        )}
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
                                        <div className="flex items-center gap-2">
                                            {/* Clickable username linking to profile */}
                                            <Link
                                                href={`/profile/${comment.userId || 1}`}
                                                className="font-medium text-primary-300 hover:text-primary-200 transition-colors"
                                            >
                                                {comment.user}
                                            </Link>
                                            <span className="text-xs text-primary-400/60">{comment.time}</span>
                                        </div>
                                        {/* Delete button - only show for comment owner */}
                                        {currentUserId && comment.userId === currentUserId && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-primary-400 hover:text-red-400 transition-colors"
                                                title="Delete comment"
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
