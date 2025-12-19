import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    filename: {
        type: String,
        required: true,
        index: true
    },
    s3Key: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    sharedToken: {
        type: String,
        unique: true,
        sparse: true  // Allows multiple documents without this field
    }
}, {
    timestamps: true
})

const File = mongoose.model('File', FileSchema)

export default File;