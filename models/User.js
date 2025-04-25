import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,  
        required: true,
        maxlength: 50,
    },
    email: {
        type: String,  
        required: true,
        unique: true,
        maxlength: 50,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String,
        default: '',
        maxlength: 200,
    },
    phone: {
        type: String,
        default: '',
        maxlength: 20,
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500,
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