import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    tasks: {
        type: Array,
        required: true,
    },
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