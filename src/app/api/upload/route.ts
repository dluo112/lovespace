import { NextRequest, NextResponse } from 'next/server';
import minioClient, { bucketName, ensureBucket } from '@/lib/minio';
import { extname } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure bucket exists
    await ensureBucket();

    // Generate organized filename: uploads/YYYY/MM/DD/timestamp-random.ext
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime();
    const random = Math.floor(Math.random() * 1000000);
    const ext = extname(file.name) || '.jpg';
    
    // Normalize filename
    const objectName = `uploads/${year}/${month}/${day}/${timestamp}-${random}${ext}`;

    // Upload to MinIO
    await minioClient.putObject(bucketName, objectName, buffer, bytes.byteLength, {
      'Content-Type': file.type || 'application/octet-stream',
    });

    // Construct URL
    // Assuming MinIO is accessible publicly via the endpoint
    // If running in Docker/internal, we might need a separate PUBLIC_MINIO_ENDPOINT
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const host = process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT || '9000';
    
    // Standard MinIO URL format: http(s)://host:port/bucket/object
    // If using path style (default for MinIO)
    let fileUrl = `${protocol}://${host}`;
    if ((protocol === 'http' && port !== '80') || (protocol === 'https' && port !== '443')) {
        fileUrl += `:${port}`;
    }
    fileUrl += `/${bucketName}/${objectName}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
