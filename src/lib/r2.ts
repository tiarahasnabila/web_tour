import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || import.meta.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || import.meta.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || import.meta.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || import.meta.env.R2_BUCKET_NAME || '';
const publicUrl = (process.env.R2_PUBLIC_URL || import.meta.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

let s3Client: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucketName && publicUrl);
}

/**
 * Upload a buffer to Cloudflare R2
 * Returns the public URL of the uploaded object
 */
export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string = 'image/jpeg',
  folder: string = 'uploads'
): Promise<string> {
  const client = getR2Client();
  if (!client || !bucketName || !publicUrl) {
    throw new Error('Cloudflare R2 is not properly configured.');
  }

  // Bersihkan nama file dan buat nama unik dengan timestamp
  const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : 'jpg';
  const cleanBase = fileName
    .split('.')[0]
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 30) || 'img';
  const uniqueKey = `${folder}/${Date.now()}-${cleanBase}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  return `${publicUrl}/${uniqueKey}`;
}

/**
 * Jika input adalah data URL Base64 (data:image/...), upload otomatis ke R2
 * dan kembalikan URL publik Cloudflare R2.
 * Jika input sudah berupa URL (http:// atau https://), kembalikan langsung.
 */
export async function ensureR2Url(
  input: string,
  fallbackName: string = 'image.jpg',
  folder: string = 'gallery'
): Promise<string> {
  if (!input) return '';
  if (!input.startsWith('data:image/')) {
    return input; // Sudah berupa URL biasa
  }

  if (!isR2Configured()) {
    console.warn('R2 is not configured, keeping base64 fallback.');
    return input;
  }

  try {
    const matches = input.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return input;
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return await uploadToR2(buffer, fallbackName, contentType, folder);
  } catch (err) {
    console.error('Failed to upload base64 to R2, keeping fallback:', err);
    return input;
  }
}
