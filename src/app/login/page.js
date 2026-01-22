'use client'

import { useState, Suspense } from 'react'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/Toast'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { showToast } = useToast()
    const redirect = searchParams.get('redirect') || '/'

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Login failed')
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            showToast('Login successful! Welcome back.', 'success')
            setTimeout(() => router.push(redirect), 500)
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="input-group">
                <Mail className="input-icon w-5 h-5" />
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field-floating"
                    placeholder=" "
                    required
                />
                <label className="input-label">Email address</label>
            </div>

            {/* Password */}
            <div className="input-group">
                <Lock className="input-icon w-5 h-5" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="input-field-floating"
                    placeholder=" "
                    required
                />
                <label className="input-label">Password</label>
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-toggle"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="btn-primary w-full justify-center py-4"
                disabled={loading}
            >
                {loading ? (
                    <div className="spinner" />
                ) : (
                    <>
                        <LogIn className="w-5 h-5" />
                        Login
                    </>
                )}
            </button>
        </form>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-heading font-bold gradient-text mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-primary-300/70">
                            Login to vote and comment on videos
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="glass rounded-2xl p-6">
                        <Suspense fallback={<div className="spinner mx-auto" />}>
                            <LoginForm />
                        </Suspense>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center mt-6 text-primary-300/70">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
