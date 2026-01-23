import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Don't return password by default
    is_blocked: { type: Boolean, default: false },
    role: { type: String, default: 'user' },
    profile_image: { type: String, default: null },
    batch_number: { type: String, default: null },
    batch_type: { type: String, default: null },
    contact: { type: String, default: null },
    blood_group: { type: String, default: null },
    address: { type: String, default: null },
    social_links: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
