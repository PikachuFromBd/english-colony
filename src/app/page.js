'use client'

import { ArrowRight, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="px-4 py-12 text-center">
                    {/* Logo */}
                    <div className="mb-6 animate-float">
                        <Image
                            src="/logo.png"
                            alt="English Colony UOS"
                            width={180}
                            height={180}
                            className="mx-auto object-contain drop-shadow-2xl"
                            priority
                        />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-heading font-bold gradient-text mb-4">
                        English Colony UOS
                    </h1>

                    {/* Description */}
                    <p className="text-primary-200/80 text-base leading-relaxed max-w-md mx-auto">
                        English colony represents the harmony of English department of University of Scholars. It is known as "Colony of Harmony" and the students are called as "Mavericks"
                    </p>
                </section>

                {/* Events Section */}
                <section className="px-4 pb-12">
                    <h2 className="text-xl font-heading font-semibold text-primary-300 mb-6">
                        Events
                    </h2>

                    {/* Event Card */}
                    <Link href="/event" className="block">
                        <div className="glass rounded-2xl overflow-hidden card-hover animate-pulse-glow">
                            {/* Event Thumbnail */}
                            <div className="relative aspect-video">
                                <Image
                                    src="/event.png"
                                    alt="Maverick চড়ুইভাতি"
                                    fill
                                    className="object-cover"
                                />
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <PlayCircle className="w-16 h-16 text-white/80" />
                                </div>
                            </div>

                            {/* Event Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-heading font-semibold text-white mb-1">
                                    Maverick চড়ুইভাতি
                                </h3>
                                <p className="text-primary-300/70 text-sm mb-4">
                                    Promo Video Contest
                                </p>

                                {/* Enter Button */}
                                <button className="btn-primary w-full justify-center">
                                    Enter Contest
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    )
}
