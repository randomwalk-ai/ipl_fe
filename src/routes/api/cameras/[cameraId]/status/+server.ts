import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch, locals }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { cameraId } = params;

		// Forward the request to the external API
		const response = await fetch(
			`https://29eu3i0mi1l4hg-8000.proxy.runpod.net/cameras/${cameraId}/status`
		);

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch camera status');
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Error fetching camera status:', err);
		// throw error(500, 'Failed to fetch camera status');
		return json({ error: 'Failed to fetch camera status' });
	}
};
