import type { APIRoute } from 'astro';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '../../../lib/r2';

const bucketName = process.env.R2_BUCKET_NAME || 'webtour-media';

export const GET: APIRoute = async ({ params }) => {
  const key = params.key;
  if (!key) {
    return new Response('Not Found', { status: 404 });
  }

  const client = getR2Client();
  if (!client) {
    return new Response('R2 not configured', { status: 500 });
  }

  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    if (!res.Body) {
      return new Response('Object empty', { status: 404 });
    }

    // Convert stream to web readable stream or arrayBuffer
    const stream = res.Body as any;
    const arrayBuffer = await stream.transformToByteArray();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': res.ContentType || 'image/jpeg',
        'Content-Length': String(res.ContentLength || arrayBuffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return new Response('Not Found', { status: 404 });
    }
    console.error('Error serving media from R2:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};
