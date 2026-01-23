import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video_id: { type: Number, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
})

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema)
