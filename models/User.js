import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,  
        required: true,
    },
    email: {
        type: String,  
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    pendingInvitations: [{
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending',
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invitedAt: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

export default mongoose.model('User', UserSchema);