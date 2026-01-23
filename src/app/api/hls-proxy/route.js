import { NextResponse } from 'next/server'

// Proxy for HLS m3u8 files to bypass CORS
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const video = searchParams.get('video')

        if (!video) {
            return NextResponse.json(
                { error: 'Video parameter required' },
                { status: 400 }
            )
        }

        // Sanitize video name to prevent path traversal
        const sanitizedVideo = video.replace(/[^a-zA-Z0-9_\-\s%]/g, '')

        // Fetch from external server
        const m3u8Url = `https://shahadathassan.cyou/videos/m3u8/${sanitizedVideo}/index.m3u8`

        const response = await fetch(m3u8Url)

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch m3u8' },
                { status: response.status }
            )
        }

        let content = await response.text()

        // Rewrite .ts segment URLs to use absolute paths
        // HLS.js needs full URLs for segments
        const baseUrl = `https://shahadathassan.cyou/videos/m3u8/${sanitizedVideo}/`
        content = content.replace(/^(?!#)(.+\.ts)$/gm, baseUrl + '$1')

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            }
        })

    } catch (error) {
        console.error('HLS proxy error:', error)
        return NextResponse.json(
            { error: 'Proxy error' },
            { status: 500 }
        )
    }
}
