import mongoose from 'mongoose'

const VoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video_id: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
})

// Uniqueness: User can only vote once per video
VoteSchema.index({ user: 1, video_id: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema)
