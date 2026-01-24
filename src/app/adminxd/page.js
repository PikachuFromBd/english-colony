'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, RefreshCw, Users, MessageSquare, Video } from 'lucide-react'

export default function AdminPanel() {
    const [key, setKey] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [data, setData] = useState({ users: [], comments: [], videos: [] })
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('videos')

    const login = () => {
        if (key === 'asha') { // 🔑 Key Check
            setIsLoggedIn(true)
            fetchData()
        } else {
            alert('Wrong Key!')
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin', {
                headers: { 'x-admin-key': 'asha' }
            })
            const json = await res.json()
            if (res.ok) setData(json)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action, id, videoId = null) => {
        if (!confirm('Are you sure?')) return
        
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-key': 'asha'
            },
            body: JSON.stringify({ action, id, videoId })
        })
        fetchData() // Refresh data
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm text-center border border-gray-800">
                    <h1 className="text-2xl font-bold text-white mb-6">Admin Access</h1>
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Enter Key"
                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-center mb-4 focus:outline-none focus:border-purple-500"
                    />
                    <button onClick={login} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
                        Enter
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <h1 className="text-xl font-bold text-purple-400">Admin Panel</h1>
                    <button onClick={fetchData} disabled={loading} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button 
                        onClick={() => setActiveTab('videos')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'videos' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
                    >
                        <Video className="w-4 h-4" /> Videos
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
                    >
                        <Users className="w-4 h-4" /> Users ({data.users.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('comments')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'comments' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Comments ({data.comments.length})
                    </button>
                </div>

                {/* --- VIDEOS TAB --- */}
                {activeTab === 'videos' && (
                    <div className="grid gap-4">
                        {data.videos.map(video => (
                            <div key={video.id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-center sm:text-left">
                                    <h3 className="font-bold text-lg text-white">{video.title}</h3>
                                    <p className="text-gray-500 text-sm">ID: {video.id}</p>
                                </div>
                                <div className="flex items-center gap-6 bg-black p-3 rounded-lg border border-gray-800">
                                    <button 
                                        onClick={() => handleAction('remove_vote', null, video.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all"
                                    >
                                        <Minus className="w-6 h-6" />
                                    </button>
                                    <div className="text-center min-w-[60px]">
                                        <span className="block text-2xl font-bold">{video.votes}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Votes</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAction('add_vote', null, video.id)}
                                        className="p-3 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 active:scale-95 transition-all"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="grid gap-3">
                        {data.users.map(user => (
                            <div key={user.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white">{user.name}</p>
                                    <p className="text-sm text-gray-400">{user.contact} • Batch {user.batch}</p>
                                </div>
                                <button 
                                    onClick={() => handleAction('delete_user', user.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete User"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- COMMENTS TAB --- */}
                {activeTab === 'comments' && (
                    <div className="grid gap-3">
                        {data.comments.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">No comments found</div>
                        ) : (
                            data.comments.map(comment => (
                                <div key={comment.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-purple-400">{comment.user}</span>
                                        <span className="text-xs text-gray-600">{new Date(comment.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3 bg-black/30 p-2 rounded">{comment.text}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                                            Video ID: {comment.video}
                                        </span>
                                        <button 
                                            onClick={() => handleAction('delete_comment', comment.id)}
                                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
