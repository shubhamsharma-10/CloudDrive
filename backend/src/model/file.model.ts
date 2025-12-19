import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
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
        default: null
    }
}, {
    timestamps: true
})  

const File = mongoose.model('File', FileSchema)

export default File;