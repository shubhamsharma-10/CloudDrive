import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from './config.js';

const s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    }
});

export const uploadToS3 = async (file: Express.Multer.File, key: string): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket: config.aws.s3BucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    await s3Client.send(command);
    return `https://${config.aws.s3BucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
};

export const deleteFromS3 = async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: config.aws.s3BucketName,
        Key: key
    });

    await s3Client.send(command);
};

export const getSignedDownloadUrl = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: config.aws.s3BucketName,
        Key: key
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
};

export default s3Client;
