import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    tasks: [{
        title: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            required: true,
        },
        priority: {
            type: Boolean,
            required: true,
        },
        dependencies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group.tasks',
        }],
    }],
    completed: {
        type: Number,
        required: true,
    },
    notCompleted: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
    },
);

export default mongoose.model('Group', GroupSchema);