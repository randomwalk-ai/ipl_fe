import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();

		if (!url || typeof url !== 'string') {
			return json({ error: 'Invalid URL' }, { status: 400 });
		}

		// Fetch the image
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
		}

		// Get the image as buffer
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Get content type
		const contentType = response.headers.get('content-type') || 'image/jpeg';

		// Convert to base64
		const base64 = buffer.toString('base64');
		const dataUrl = `data:${contentType};base64,${base64}`;

		return json({ dataUrl });
	} catch (error) {
		console.error('Error proxying image:', error);
		return json({ error: 'Failed to proxy image' }, { status: 500 });
	}
};
