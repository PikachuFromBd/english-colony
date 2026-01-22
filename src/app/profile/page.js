'use client'

import { useState, useEffect } from 'react'
import {
    Camera,
    User,
    Phone,
    Droplet,
    MapPin,
    Link as LinkIcon,
    Save,
    Edit3,
    LogOut,
    Home,
    Facebook,
    Instagram,
    MessageCircle,
    Twitter,
    Linkedin,
    Github,
    Youtube,
    Globe
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/Toast'

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

export default function ProfilePage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [profileImage, setProfileImage] = useState(null)
    const [userId, setUserId] = useState(null)
    const [token, setToken] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        batchNumber: '',
        batchType: 'R',
        contact: '',
        bloodGroup: '',
        address: '',
        socialLinks: [''],
    })

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (!storedToken) {
            router.push('/login?redirect=/profile')
            return
        }
        setToken(storedToken)

        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setUserId(user.id)
        setFormData({
            name: user.name || '',
            batchNumber: user.batchNumber || '',
            batchType: user.batchType || 'R',
            contact: user.contact || '',
            bloodGroup: user.bloodGroup || '',
            address: user.address || '',
            socialLinks: user.socialLinks?.length ? user.socialLinks : [''],
        })
        setProfileImage(user.profileImage || null)

        // Fetch latest profile from database
        if (user.id) {
            fetchProfile(user.id)
        }
    }, [router])

    const fetchProfile = async (id) => {
        try {
            const res = await fetch(`/api/profile/${id}`)
            const data = await res.json()
            if (data.user) {
                setFormData({
                    name: data.user.name || '',
                    batchNumber: data.user.batchNumber || '',
                    batchType: data.user.batchType || 'R',
                    contact: data.user.contact || '',
                    bloodGroup: data.user.bloodGroup || '',
                    address: data.user.address || '',
                    socialLinks: data.user.socialLinks?.length ? data.user.socialLinks : [''],
                })
                if (data.user.profileImage) {
                    setProfileImage(data.user.profileImage)
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size must be less than 5MB', 'error')
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                setProfileImage(e.target?.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, '']
        }))
    }

    const updateSocialLink = (index, value) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map((link, i) => i === index ? value : link)
        }))
    }

    const removeSocialLink = (index) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        if (!userId || !token) {
            showToast('Please login again', 'error')
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`/api/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    profileImage
                })
            })

            const data = await res.json()

            if (res.ok) {
                // Update localStorage with new data
                localStorage.setItem('user', JSON.stringify(data.user))
                if (data.user.profileImage) {
                    setProfileImage(data.user.profileImage)
                }
                setIsEditing(false)
                showToast('Profile updated successfully!', 'success')
            } else {
                showToast(data.message || 'Failed to update profile', 'error')
            }
        } catch (error) {
            console.error('Update error:', error)
            showToast('Failed to update profile. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        showToast('Logged out successfully', 'success')
        setTimeout(() => router.push('/'), 500)
    }

    const batchDisplay = formData.batchNumber
        ? `${formData.batchNumber} ${formData.batchType}`
        : 'N/A'

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-950 to-black">
            {/* Back Button */}
            <div className="sticky top-0 z-50 glass-dark px-4 py-3">
                <Link href="/" className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-primary-300 hover:text-primary-200 transition-colors">
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                </Link>
            </div>

            {/* Profile Content */}
            <div className="px-4 py-8 max-w-md mx-auto">

                {/* Profile Image */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden glass glow">
                            {profileImage ? (
                                <Image
                                    src={profileImage}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-800">
                                    <User className="w-16 h-16 text-primary-300" />
                                </div>
                            )}
                        </div>

                        {/* Edit Image Button */}
                        <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer hover:bg-primary-500 transition-colors">
                            <Camera className="w-5 h-5 text-white" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                </div>

                {/* Name & Batch */}
                <div className="text-center mb-8">
                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="input-field text-center text-lg font-semibold"
                            />
                            {/* Fixed batch inputs - equal sizing */}
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Batch"
                                    value={formData.batchNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                                    className="input-field w-1/2 text-center"
                                />
                                <select
                                    value={formData.batchType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, batchType: e.target.value }))}
                                    className="input-field w-1/2 text-center"
                                >
                                    <option value="R">Regular (R)</option>
                                    <option value="W">Weekend (W)</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-heading font-bold text-white mb-2">
                                {formData.name || 'Your Name'}
                            </h1>
                            <span className="inline-block px-4 py-1 rounded-full glass text-primary-300 text-sm font-medium">
                                Batch {batchDisplay}
                            </span>
                        </>
                    )}
                </div>

                {/* Profile Details */}
                <div className="space-y-4 mb-8">
                    {/* Contact & Blood Group - Fixed equal sizing */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 text-primary-400 mb-2">
                                <Phone className="w-4 h-4" />
                                <span className="text-xs">Contact</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={formData.contact}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                                    className="input-field text-sm py-2"
                                />
                            ) : (
                                <p className="text-white font-medium text-sm">{formData.contact || 'Not set'}</p>
                            )}
                        </div>

                        <div className="glass rounded-xl p-4">
                            <div className="flex items-center gap-2 text-primary-400 mb-2">
                                <Droplet className="w-4 h-4" />
                                <span className="text-xs">Blood</span>
                            </div>
                            {isEditing ? (
                                <select
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                                    className="input-field text-sm py-2"
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            ) : (
                                <p className="text-white font-medium text-sm">{formData.bloodGroup || 'Not set'}</p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">Address</span>
                        </div>
                        {isEditing ? (
                            <textarea
                                placeholder="Your address"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                className="input-field text-sm py-2 resize-none"
                                rows={2}
                            />
                        ) : (
                            <p className="text-white">{formData.address || 'Not set'}</p>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 text-primary-400 mb-3">
                            <LinkIcon className="w-4 h-4" />
                            <span className="text-xs">Social Links</span>
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                {formData.socialLinks.map((link, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={link}
                                            onChange={(e) => updateSocialLink(index, e.target.value)}
                                            className="input-field text-sm py-2 flex-1"
                                        />
                                        {formData.socialLinks.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSocialLink(index)}
                                                className="text-red-400 hover:text-red-300 px-2"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSocialLink}
                                    className="text-primary-400 text-sm hover:text-primary-300"
                                >
                                    + Add link
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {formData.socialLinks.filter(l => l).length > 0 ? (
                                    formData.socialLinks.filter(l => l).map((link, index) => {
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
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {isEditing ? (
                        <button
                            onClick={handleSubmit}
                            className="btn-primary w-full justify-center py-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Update Profile
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary w-full justify-center py-4"
                        >
                            <Edit3 className="w-5 h-5" />
                            Edit Profile
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="btn-secondary w-full justify-center py-4"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}
