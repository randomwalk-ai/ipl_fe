import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_RUNPOD_BASE_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ params, fetch, locals }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { cameraId, action } = params;

		// Validate action
		if (action !== 'start' && action !== 'stop') {
			throw error(400, 'Invalid action. Must be "start" or "stop"');
		}

		// Forward the request to the external API
		const response = await fetch(
			`https://29eu3i0mi1l4hg-8000.proxy.runpod.net/cameras/${cameraId}/${action}`,
			{
				method: 'POST'
			}
		);

		if (!response.ok) {
			throw error(response.status, `Failed to ${action} camera`);
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error(`Error performing camera action:`, err);
		throw error(500, 'Failed to perform camera action');
	}
};
