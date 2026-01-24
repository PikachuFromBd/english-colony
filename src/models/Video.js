import mongoose from 'mongoose'

const VideoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping your ID 1, 2, 3
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    m3u8Proxy: { type: String }, // For your HLS player
    created_at: { type: Date, default: Date.now }
})

export default mongoose.models.Video || mongoose.model('Video', VideoSchema)
