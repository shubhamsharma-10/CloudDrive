import { Request, Response } from 'express';
import s3Client from '../config/s3.js';
import config from '../config/config.js';
import File from '../model/file.model.js';
import { 
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
}

export default fileController;