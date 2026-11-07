import crypto from 'crypto';

const SECRET = process.env.ADMIN_SECRET || import.meta.env.ADMIN_SECRET || 'beyond-jogja-default-secret-key-change-in-production';

export function createSessionToken(username: string): string {
  const data = `${username}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string | undefined | null): { username: string } | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 3) return null;
    const [username, timestampStr, signature] = parts;
    const data = `${username}:${timestampStr}`;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('hex');

    if (signature !== expectedSig) return null;

    // Token valid for 7 days
    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) return null;

    return { username };
  } catch {
    return null;
  }
}

