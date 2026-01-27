import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const bucketName = process.env.MINIO_BUCKET_NAME || 'lovespace';

// Ensure bucket exists (lazy initialization)
let bucketChecked = false;

export async function ensureBucket() {
  if (bucketChecked) return;
  
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1'); // Region doesn't matter much for self-hosted
      // Set policy to public read if needed, but usually we just want to access via signed URLs or public bucket
      // For simplicity in this project, we assume public bucket or we will return a presigned URL?
      // Actually, if it's for a website, we usually want public read access for uploaded images.
      // Setting policy is a bit complex via code, usually done manually.
      // But we can try to set a readonly policy.
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    }
    bucketChecked = true;
  } catch (err) {
    console.error('MinIO bucket check failed:', err);
    // Don't crash, might be permissions issue
  }
}

export default minioClient;
