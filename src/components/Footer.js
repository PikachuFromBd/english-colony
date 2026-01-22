'use client'

import { Facebook, Instagram, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
    const socialLinks = [
        {
            icon: Facebook,
            href: 'https://facebook.com/englishcolonyuos',
            label: 'Facebook',
            className: 'icon-facebook'
        },
        {
            icon: Instagram,
            href: 'https://instagram.com/englishcolonyuos',
            label: 'Instagram',
            className: 'icon-instagram'
        },
        {
            icon: MessageCircle,
            href: 'https://wa.me/yourwhatsappnumber',
            label: 'WhatsApp',
            className: 'icon-whatsapp'
        },
    ]

    return (
        <footer className="glass-dark mt-auto border-t border-primary-500/20">
            <div className="w-full px-6 py-8">
                {/* Social Links */}
                <div className="flex items-center justify-center gap-8 mb-5">
                    {socialLinks.map((social) => (
                        <Link
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-12 h-12 rounded-full glass flex items-center justify-center transition-all hover:scale-110 hover:glow-sm ${social.className}`}
                            aria-label={social.label}
                        >
                            <social.icon className="w-6 h-6 text-primary-300 transition-colors" />
                        </Link>
                    ))}
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-sm text-primary-300/60">
                        © 2026 English Colony UOS
                    </p>
                </div>
            </div>
        </footer>
    )
}
