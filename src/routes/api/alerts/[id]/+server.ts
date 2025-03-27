import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_RUNPOD_BASE_URL } from '$env/static/public';

// DELETE endpoint to remove an alert
export const DELETE: RequestHandler = async ({ params, fetch }) => {
	const alertId = params.id;

	try {
		const response = await fetch(`${PUBLIC_RUNPOD_BASE_URL}/alerts/${alertId}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error(`API responded with status: ${response.status}`);
		}

		return json({ success: true });
	} catch (error) {
		console.error(`Error deleting alert ${alertId}:`, error);
		return json({ error: 'Failed to delete alert' }, { status: 500 });
	}
};

// POST endpoint to stop an alert
export const POST: RequestHandler = async ({ params, fetch, request }) => {
	const alertId = params.id;
	const { action } = await request.json();

	if (action !== 'stop') {
		return json({ error: 'Invalid action' }, { status: 400 });
	}

	try {
		const response = await fetch(`${PUBLIC_RUNPOD_BASE_URL}/alerts/${alertId}/stop`, {
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`API responded with status: ${response.status}`);
		}

		return json({ success: true });
	} catch (error) {
		console.error(`Error stopping alert ${alertId}:`, error);
		return json({ error: 'Failed to stop alert' }, { status: 500 });
	}
};
