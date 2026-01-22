'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Trophy } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const fallbackVideos = [
    {
        id: 1,
        title: '16th Batch Promo',
        description: 'Amazing promo video from 16th batch students.',
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
        description: 'Capturing the spirit of learning and growth.',
        filename: 'IMG_3237.MP4',
        votes: 0,
    },
]

export default function EventPage() {
    const [videos, setVideos] = useState(fallbackVideos)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/videos')
            const data = await res.json()
            if (data.videos && data.videos.length > 0) {
                // Sort by votes (highest first)
                const sortedVideos = [...data.videos].sort((a, b) => (b.votes || 0) - (a.votes || 0))
                setVideos(sortedVideos)
            }
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 px-4 py-6">
                {/* Event Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-heading font-bold gradient-text mb-2">
                        Maverick চড়ুইভাতি
                    </h1>
                    <p className="text-lg text-primary-300 font-medium mb-3">
                        Promo Video Contest
                    </p>
                    <p className="text-primary-200/70 text-sm">
                        Watch the amazing promo videos created by our talented students and vote for your favorite one!
                    </p>
                </div>

                {/* Vote Section Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                    <h2 className="text-lg font-heading font-semibold text-white">
                        Vote for the Best Video
                    </h2>
                </div>

                {/* Video Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {videos.map((video, index) => (
                            <Link key={video.id} href={`/video/${video.id}`}>
                                <div className="glass rounded-xl overflow-hidden card-hover mb-4 relative">
                                    {/* Top video badge */}
                                    {index === 0 && video.votes > 0 && (
                                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/90 text-black text-xs font-bold">
                                            <Trophy className="w-3 h-3" />
                                            <span>Top</span>
                                        </div>
                                    )}

                                    {/* Video Thumbnail */}
                                    <div className="relative aspect-video bg-primary-900/50">
                                        {/* Video poster/thumbnail */}
                                        <video
                                            src={`/videos/${video.filename}`}
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                            muted
                                            playsInline
                                        />

                                        {/* Play overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors">
                                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white ml-1" fill="white" />
                                            </div>
                                        </div>

                                        {/* Title Overlay */}
                                        <div className="video-overlay">
                                            <h3 className="text-white font-medium text-lg">
                                                {video.title}
                                            </h3>
                                            {video.votes > 0 && (
                                                <p className="text-primary-300 text-sm mt-1">
                                                    🔥 {video.votes} votes
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
