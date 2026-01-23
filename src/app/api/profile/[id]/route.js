import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import User from '@/models/User'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { logError } from '@/lib/logger'

export async function GET(request, { params }) {
    try {
        await dbConnect()
        const userId = params.id

        // Check if viewing user is the profile owner
        const viewingUser = getUserFromRequest(request)
        const isOwner = viewingUser && viewingUser.id === userId

        // Fetch user from database
        const user = await User.findById(userId)

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        // Mask phone number for non-owners
        let displayContact = user.contact
        if (user.contact && !isOwner) {
            // Show only last 4 digits, mask the rest with asterisks
            const contact = user.contact.toString()
            if (contact.length > 4) {
                displayContact = '*'.repeat(contact.length - 4) + contact.slice(-4)
            } else {
                displayContact = '****'
            }
        }

        return NextResponse.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                profileImage: user.profile_image,
                batchNumber: user.batch_number,
                batchType: user.batch_type,
                contact: displayContact,
                bloodGroup: user.blood_group,
                address: user.address,
                socialLinks: user.social_links || [], // Already an array in Mongoose
            }
        })
    } catch (error) {
        console.error('Profile fetch error:', error)
        logError('Profile API GET Error', error)
        return NextResponse.json(
            { message: 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect()
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            )
        }

        const userId = params.id

        // Only allow users to update their own profile
        if (user.id !== userId) {
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

        // Update database (Mongoose)
        const updatedUser = await User.findByIdAndUpdate(userId, {
            name,
            batch_number: batchNumber || null,
            batch_type: batchType || null,
            contact: contact || null,
            blood_group: bloodGroup || null,
            address: address || null,
            social_links: socialLinks || [],
            ...(imagePath && { profile_image: imagePath })
        }, { new: true }) // Return updated doc

        if (!updatedUser) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id.toString(),
                name: updatedUser.name,
                profileImage: updatedUser.profile_image,
                batchNumber: updatedUser.batch_number,
                batchType: updatedUser.batch_type,
                contact: updatedUser.contact,
                bloodGroup: updatedUser.blood_group,
                address: updatedUser.address,
                socialLinks: updatedUser.social_links,
            }
        })

    } catch (error) {
        console.error('Profile update error:', error)
        logError('Profile API PUT Error', error)
        return NextResponse.json(
            { message: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
