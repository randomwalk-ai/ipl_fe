import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Get the search parameters from the request
		const searchParams = await request.json();

		// Validate the search parameters
		if (!searchParams.query || !searchParams.query.trim()) {
			throw error(400, 'Search query is required');
		}

		// Make the request to the external search service
		// const response = await fetch('http://localhost:8000/search/text', {
		const response = await fetch('http://172.16.1.8:8000/search/text', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: searchParams.query,
				limit: searchParams.limit || 20,
				search_type: searchParams.search_type || ['image', 'description']
			})
		});

		if (!response.ok) {
			throw error(response.status, `Search service returned error: ${response.statusText}`);
		}

		const searchResults = await response.json();
		return json(searchResults.results);
	} catch (err) {
		console.error('Search error:', err);
		if (err instanceof Response) {
			throw err;
		}
		throw error(500, 'Failed to perform search');
	}
};
