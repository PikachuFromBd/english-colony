'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const errorMsg = searchParams.get('message') || 'An unknown error occurred'
    const errorStack = searchParams.get('stack')
    const statusCode = searchParams.get('code') || '500'

    return (
        <div className="glass rounded-2xl p-8 max-w-2xl w-full mx-auto border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">
                    System Error ({statusCode})
                </h1>
                <p className="text-primary-300">
                    The application encountered a critical issue.
                </p>
            </div>

            <div className="bg-black/50 rounded-xl p-4 overflow-x-auto mb-6 border border-white/10 text-left">
                <h3 className="text-red-400 font-bold mb-2 text-sm uppercase tracking-wider">Error Details</h3>
                <code className="text-white block whitespace-pre-wrap font-mono text-sm break-words">
                    {errorMsg}
                </code>

                {errorStack && (
                    <>
                        <div className="my-4 border-t border-white/10"></div>
                        <h3 className="text-primary-400 font-bold mb-2 text-sm uppercase tracking-wider">Stack Trace</h3>
                        <pre className="text-primary-300/70 text-xs overflow-x-auto">
                            {errorStack}
                        </pre>
                    </>
                )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
                <button
                    onClick={() => window.location.reload()}
                    className="btn-secondary"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Connection
                </button>
                <Link href="/" className="btn-primary">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>
        </div>
    )
}

export default function ErrorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-red-950/30 to-black flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading error details...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
