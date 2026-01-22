'use client'

import { useState, useEffect } from 'react'
import {
    User,
    Phone,
    Droplet,
    MapPin,
    ArrowLeft,
    Facebook,
    Instagram,
    MessageCircle,
    Twitter,
    Linkedin,
    Github,
    Youtube,
    Globe
} from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Auto-detect social platform from URL
const getSocialIcon = (url) => {
    if (!url) return Globe
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return Facebook
    if (lowerUrl.includes('instagram.com')) return Instagram
    if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp')) return MessageCircle
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return Twitter
    if (lowerUrl.includes('linkedin.com')) return Linkedin
    if (lowerUrl.includes('github.com')) return Github
    if (lowerUrl.includes('youtube.com')) return Youtube
    return Globe
}

const getSocialClassName = (url) => {
    if (!url) return ''
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return 'icon-facebook'
    if (lowerUrl.includes('instagram.com')) return 'icon-instagram'
    if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp')) return 'icon-whatsapp'
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'icon-twitter'
    if (lowerUrl.includes('linkedin.com')) return 'icon-linkedin'
    if (lowerUrl.includes('github.com')) return 'icon-github'
    if (lowerUrl.includes('youtube.com')) return 'icon-youtube'
    return ''
}

export default function PublicProfilePage() {
    const params = useParams()
    const userId = params.id
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchProfile()
    }, [userId])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/profile/${userId}`)
            const data = await res.json()

            if (res.ok && data.user) {
                setProfile(data.user)
            } else {
                setError(data.message || 'User not found')
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            setError('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-950 to-black">
                <div className="spinner" />
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-950 to-black">
                <User className="w-20 h-20 text-primary-400/40 mb-4" />
                <h1 className="text-xl font-heading font-bold text-white mb-2">User Not Found</h1>
                <p className="text-primary-300/60 mb-6">{error || "This profile doesn't exist."}</p>
                <Link href="/" className="btn-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Go Home
                </Link>
            </div>
        )
    }

    const batchDisplay = profile.batchNumber
        ? `${profile.batchNumber} ${profile.batchType || ''}`
        : null

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-950 to-black">
            {/* Back Button */}
            <div className="sticky top-0 z-50 glass-dark px-4 py-3">
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary-300 hover:text-primary-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
            </div>

            {/* Profile Content */}
            <div className="px-4 py-8 max-w-md mx-auto">

                {/* Profile Image */}
                <div className="flex justify-center mb-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden glass glow">
                        {profile.profileImage ? (
                            <Image
                                src={profile.profileImage}
                                alt={profile.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-800">
                                <User className="w-14 h-14 text-primary-300" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name & Batch */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-heading font-bold text-white mb-2">
                        {profile.name}
                    </h1>
                    {batchDisplay && (
                        <span className="inline-block px-4 py-1 rounded-full glass text-primary-300 text-sm font-medium">
                            Batch {batchDisplay}
                        </span>
                    )}
                </div>

                {/* Profile Details - Show all available info */}
                <div className="space-y-4">
                    {/* Contact & Blood Group */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 text-primary-400 mb-2">
                                <Phone className="w-4 h-4" />
                                <span className="text-xs">Contact</span>
                            </div>
                            <p className="text-white font-medium text-sm">{profile.contact || 'Not set'}</p>
                        </div>

                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 text-primary-400 mb-2">
                                <Droplet className="w-4 h-4" />
                                <span className="text-xs">Blood</span>
                            </div>
                            <p className="text-white font-medium text-sm">{profile.bloodGroup || 'Not set'}</p>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">Address</span>
                        </div>
                        <p className="text-white">{profile.address || 'Not set'}</p>
                    </div>

                    {/* Social Links */}
                    <div className="glass rounded-xl p-4">
                        <p className="text-primary-400 text-xs mb-3">Social Links</p>
                        <div className="flex flex-wrap gap-3">
                            {profile.socialLinks && profile.socialLinks.filter(l => l).length > 0 ? (
                                profile.socialLinks.filter(l => l).map((link, index) => {
                                    const Icon = getSocialIcon(link)
                                    const className = getSocialClassName(link)
                                    return (
                                        <a
                                            key={index}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:scale-110 ${className}`}
                                        >
                                            <Icon className="w-5 h-5 text-primary-300 transition-colors" />
                                        </a>
                                    )
                                })
                            ) : (
                                <p className="text-primary-400/60 text-sm">No links added</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
