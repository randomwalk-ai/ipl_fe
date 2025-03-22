import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET endpoint to fetch all alerts
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const response = await fetch('https://29eu3i0mi1l4hg-8000.proxy.runpod.net/alerts');

		if (!response.ok) {
			throw new Error(`API responded with status: ${response.status}`);
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Error fetching alerts:', error);
		return json({ error: 'Failed to fetch alerts' }, { status: 500 });
	}
};

// POST endpoint to create a new alert
export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const alertData = await request.json();

		// Validate the request body
		if (!alertData.query) {
			return json({ error: 'Query is required' }, { status: 400 });
		}

		// Set default interval if not provided
		if (!alertData.interval_seconds) {
			alertData.interval_seconds = 60;
		}

		const response = await fetch('https://29eu3i0mi1l4hg-8000.proxy.runpod.net/alerts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(alertData)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`API responded with status: ${response.status}, ${errorText}`);
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Error creating alert:', error);
		return json({ error: 'Failed to create alert' }, { status: 500 });
	}
};
