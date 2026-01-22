'use client'

import { useState, Suspense } from 'react'
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/Toast'

function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { showToast } = useToast()
    const redirect = searchParams.get('redirect') || '/'

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
        }

        if (formData.password.length < 6) {
            showToast('Password must be at least 6 characters', 'error')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Signup failed')
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            showToast('Account created successfully!', 'success')
            setTimeout(() => router.push('/profile'), 500)
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="input-group">
                <User className="input-icon w-5 h-5" />
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field-floating"
                    placeholder=" "
                    required
                />
                <label className="input-label">Full Name</label>
            </div>

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

            {/* Confirm Password */}
            <div className="input-group">
                <Lock className="input-icon w-5 h-5" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field-floating"
                    placeholder=" "
                    required
                />
                <label className="input-label">Confirm Password</label>
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
                        <UserPlus className="w-5 h-5" />
                        Create Account
                    </>
                )}
            </button>
        </form>
    )
}

export default function SignupPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-heading font-bold gradient-text mb-2">
                            Join English Colony
                        </h1>
                        <p className="text-primary-300/70">
                            Create an account to participate in the contest
                        </p>
                    </div>

                    {/* Signup Form */}
                    <div className="glass rounded-2xl p-6">
                        <Suspense fallback={<div className="spinner mx-auto" />}>
                            <SignupForm />
                        </Suspense>
                    </div>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-primary-300/70">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                            Login
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
