import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(request, { params }) {
    try {
        const userId = params.id

        // Fetch user from database
        const users = await query(
            `SELECT id, name, profile_image, batch_number, batch_type, contact, blood_group, address, social_links 
       FROM users WHERE id = ?`,
            [userId]
        )

        if (users.length === 0) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        const user = users[0]

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                profileImage: user.profile_image,
                batchNumber: user.batch_number,
                batchType: user.batch_type,
                contact: user.contact,
                bloodGroup: user.blood_group,
                address: user.address,
                socialLinks: user.social_links ? JSON.parse(user.social_links) : [],
            }
        })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { message: 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const userId = params.id

        // Only allow users to update their own profile
        if (user.id !== parseInt(userId)) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { name, batchNumber, batchType, contact, bloodGroup, address, socialLinks, profileImage } = body

        // Handle profile image upload if it's a base64 string
        let imagePath = null
        if (profileImage && profileImage.startsWith('data:image')) {
            // Extract base64 data
            const matches = profileImage.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
            if (matches) {
                const ext = matches[1]
                const base64Data = matches[2]
                const buffer = Buffer.from(base64Data, 'base64')

                // Create filename with user ID
                const filename = `profile_${userId}_${Date.now()}.${ext}`
                const uploadDir = path.join(process.cwd(), 'public', 'images')

                // Ensure directory exists
                await mkdir(uploadDir, { recursive: true })

                // Write file
                await writeFile(path.join(uploadDir, filename), buffer)
                imagePath = `/images/${filename}`
            }
        } else if (profileImage && !profileImage.startsWith('data:')) {
            // Keep existing path if it's already a URL
            imagePath = profileImage
        }

        // Update database
        await query(
            `UPDATE users SET 
        name = ?,
        batch_number = ?,
        batch_type = ?,
        contact = ?,
        blood_group = ?,
        address = ?,
        social_links = ?
        ${imagePath ? ', profile_image = ?' : ''}
       WHERE id = ?`,
            imagePath
                ? [name, batchNumber || null, batchType || null, contact || null, bloodGroup || null, address || null, JSON.stringify(socialLinks || []), imagePath, userId]
                : [name, batchNumber || null, batchType || null, contact || null, bloodGroup || null, address || null, JSON.stringify(socialLinks || []), userId]
        )

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: parseInt(userId),
                name,
                profileImage: imagePath || profileImage,
                batchNumber,
                batchType,
                contact,
                bloodGroup,
                address,
                socialLinks,
            }
        })

    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { message: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
