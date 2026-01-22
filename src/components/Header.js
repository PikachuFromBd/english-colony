'use client'

import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
    }, [])

    return (
        <header className="sticky top-0 z-50 glass-dark w-full">
            <div className="w-full flex items-center justify-between px-4 py-4">
                {/* Logo - Increased size */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="English Colony"
                        width={56}
                        height={56}
                        className="object-contain"
                    />
                </Link>

                {/* Title in Center */}
                <h1 className="text-lg font-heading font-bold gradient-text">
                    English Colony
                </h1>

                {/* Profile Icon - Increased size */}
                <Link
                    href={isLoggedIn ? "/profile" : "/login"}
                    className="w-12 h-12 rounded-full glass flex items-center justify-center transition-all hover:glow-sm"
                >
                    <User className="w-6 h-6 text-primary-300" />
                </Link>
            </div>
        </header>
    )
}
