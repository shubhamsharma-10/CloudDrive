import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT,
    mongodb: process.env.MONGODB_URL,
    jwtSecret: process.env.JWT_SECRET || 'default',
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || '',
        s3BucketName: process.env.AWS_S3_BUCKET_NAME || ''
    }
}

export default config;