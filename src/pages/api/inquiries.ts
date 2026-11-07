import type { APIRoute } from 'astro';
import { sql } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    let name = '';
    let phone = '';
    let service = '';
    let trip_date = null;
    let message = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await request.json();
      name = (data.name || '').trim();
      phone = (data.phone || '').trim();
      service = (data.service || '').trim();
      trip_date = data.date ? data.date : null;
      message = (data.message || '').trim();
    } else {
      const formData = await request.formData();
      name = (formData.get('name')?.toString() || '').trim();
      phone = (formData.get('phone')?.toString() || '').trim();
      service = (formData.get('service')?.toString() || '').trim();
      const dateVal = formData.get('date')?.toString() || '';
      trip_date = dateVal ? dateVal : null;
      message = (formData.get('message')?.toString() || '').trim();
    }

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'Nama dan nomor HP wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await sql`
      INSERT INTO inquiries (name, phone, service, trip_date, message, status)
      VALUES (${name}, ${phone}, ${service}, ${trip_date}, ${message}, 'baru')
      RETURNING id;
    `;

    return new Response(JSON.stringify({ success: true, id: result[0]?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Inquiry API Error:', err);
    return new Response(JSON.stringify({ error: 'Gagal menyimpan pesan: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

