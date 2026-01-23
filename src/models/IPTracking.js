import mongoose from 'mongoose'

const IPTrackingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip_address: { type: String, required: true },
    user_agent: { type: String, default: 'Unknown' },
    created_at: { type: Date, default: Date.now }
})

export default mongoose.models.IPTracking || mongoose.model('IPTracking', IPTrackingSchema)
