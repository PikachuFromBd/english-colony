import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Video from '@/models/Video'

export async function GET() {
    await dbConnect()

    // Your current hardcoded data
    const videosToSave = [
        {
            id: 1,
            title: '16th Batch Promo',
            description: '',
            url: 'https://shahadathassan.cyou/videos/16th%20promo.mp4',
            m3u8Proxy: '/api/hls-proxy?video=16th%20promo',
        },
        {
            id: 2,
            title: '18th Batch Promo',
            description: `What is going to happen on January 31? 🤯\n\nDirector: Ibtisam Alam Pial\n\nCast:\nRayhan Omi, Ibtisam Alam Pial, Raiyan Noor Talha, Farzana Sultana Khan, Shamsul Arafin Rafi, Shahmita Alam Yeana, Shuvojit Chakroborty, Sadia Tabassum Sriti, Raisul Islam\n\nCinematography: Ibtisam Alam Pial, Raiyan Noor Talha, Arko Islam Saim\nGFX: Shamsul Arafin Rafi\nVFX: Ibtisam Alam Pial\nVoiceover: Farzana Sultana Khan\nEditor: Ibtisam Alam Pial\n\nSpecial Thanks to Najmul Huda Sir\n\nPresented by: 18th Batch | Department of English | University of Scholars`,
            url: 'https://shahadathassan.cyou/videos/IMG_0399.MOV',
            m3u8Proxy: '/api/hls-proxy?video=IMG_0399',
        },
        {
            id: 3,
            title: '17th Batch Promo',
            description: 'This is simply Dramatic... This is innovative.',
            url: 'https://shahadathassan.cyou/videos/IMG_3237.MP4',
            m3u8Proxy: '/api/hls-proxy?video=IMG_3237',
        },
    ]

    try {
        // Delete old videos to avoid duplicates (optional, safe for first run)
        await Video.deleteMany({}) 
        
        // Insert new videos
        await Video.insertMany(videosToSave)

        return NextResponse.json({ message: 'Videos uploaded to Database successfully!' })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
