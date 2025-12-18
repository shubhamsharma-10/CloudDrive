import { Request, Response } from 'express';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/s3.js';
import config from '../config/config.js';
import File from '../model/file.model.js';
import { 
    DeleteObjectCommand, 
    GetObjectCommand, 
    PutObjectCommand 
} from '@aws-sdk/client-s3';

const fileController = {
    uploadFile: async(req: Request, res: Response) => {
        try {
            // @ts-ignore
            const userId = req.userId;
            const file = req.file;


            console.log("Files : ", file);
            
            if(!file){
                return res.status(400).json({message: 'No file uploaded'});
            }
            // @ts-ignore
            const s3key = `${userId}/${Date.now()}-${file.originalname}`
            console.log("S3 Key : ", s3key);
            const command  = new PutObjectCommand({
                Bucket: config.aws.s3BucketName,
                Key: s3key,
                Body: file.buffer,
                ContentType: file.mimetype
            })

            const response = await s3Client.send(command);
            console.log("Res : ", response);
            const newFile = await File.create({
                userId: userId,
                filename: file.originalname,
                s3Key: s3key,
                mimeType: file.mimetype,
                size: file.size
            })
            res.status(200).json({
                message: 'File uploaded successfully',
                file: newFile
            });
            // const file
        } catch (error) {
            console.error('File upload error:', error);
            res.status(500).json({ message: 'Server error during file upload' });
        }
    },
    
    getFile: async(req: Request, res: Response) => {
        try {
            // @ts-ignore
            const allFile = await File.find({ userId: req.userId}).sort({ createdAt: -1})
            res.status(200).json({
                message: 'Files fetched successfully',
                files: allFile
            });
        } catch (error) {
            console.error('Get files error:', error);
            res.status(500).json({ message: 'Server error during fetching files' });
        }
    },

    renameFile: async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { newFilename } = req.body;
            const file = await File.findById(id);
            if (!file) {
                res.status(404).json({ message: 'File not found' });
                return;
            }
            file.filename = newFilename;
            await file.save();
            res.status(200).json({
                message: 'File renamed successfully',
                file
            });
        } catch (error) {
            console.error('Rename file error:', error);
            res.status(500).json({ message: 'Server error during renaming file' });
        }
    },

    deleteFile: async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const file = await File.findById(id);
            if (!file) {
                res.status(404).json({ message: 'File not found' });
                return;
            }
            // Delete from S3
            const command = new DeleteObjectCommand({
                Bucket: config.aws.s3BucketName,
                Key: file.s3Key
            })
            const response = await s3Client.send(command);
            console.log("Delete response : ", response);
            const responsedb = await file.deleteOne()
            console.log("Delete from db: ", responsedb);
            res.status(200).json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error('Delete file error:', error);
            res.status(500).json({ message: 'Server error during deleting file' });
        }
    },

    downloadFile: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            // @ts-ignore
            const file = await File.findOne({ _id: id, userId: req.userId })
            if(!file) {
                res.status(404).json({
                    message: 'File not found'
                })
            }
            const command = new GetObjectCommand({
                Bucket: config.aws.s3BucketName,
                Key: file?.s3Key
            })

            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
            res.status(200).json({
                message: 'Download URL generated successfully',
                url
            });
        } catch (error) {
            console.error('Download file error:', error);
            res.status(500).json({ message: 'Server error during downloading file' });
        }
    }
}

export default fileController;