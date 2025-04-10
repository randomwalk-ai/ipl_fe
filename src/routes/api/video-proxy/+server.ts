import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	try {
		const videoUrl = url.searchParams.get('url');

		if (!videoUrl) {
			throw error(400, 'Missing video URL');
		}

		const response = await fetch(videoUrl);

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch video');
		}

		// Create a new response with headers that will make the browser play the video
		return new Response(response.body, {
			status: 200,
			headers: {
				'Content-Type': 'video/mp4',
				'Content-Disposition': 'inline',
				'Accept-Ranges': 'bytes'
			}
		});
	} catch (err) {
		console.error('Video proxy error:', err);
		throw error(500, 'Failed to proxy video');
	}
};
