'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log the error to console
        console.error('Global Error caught:', error)

        // Redirect to detail error page with info
        if (typeof window !== 'undefined') {
            const msg = encodeURIComponent(error.message || 'Unknown error')
            const stack = encodeURIComponent(error.stack || '')
            window.location.href = `/error?message=${msg}&stack=${stack}&code=APP_CRASH`
        }
    }, [error])

    return (
        <html>
            <body className="bg-black text-white p-10 font-sans">
                <h2>Something went wrong!</h2>
                <button
                    onClick={() => reset()}
                    className="mt-4 px-4 py-2 bg-blue-600 rounded text-white"
                >
                    Try again
                </button>
            </body>
        </html>
    )
}
