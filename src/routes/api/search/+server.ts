import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { frigateInstances } from '$lib/utils';
import type { FrigateEvent, FrigateSearchResponse } from '../../(protected)/types';
import { z } from 'zod';

const frigateUrls = frigateInstances.map((el) => el.url);

// Updated Zod Schema
const searchSchema = z.object({
	// Standard search fields
	query: z.string().optional(), // Optional because similarity doesn't use it
	limit: z.number().int().positive().optional().default(25),
	cameras: z.string().array().optional(),
	labels: z.string().array().optional(),
	zones: z.string().array().optional(),
	before: z.number().optional(),
	after: z.number().optional(),
	stationary: z.boolean().optional(),
	hasSnapshot: z.boolean().optional(), // Renamed has_snapshot in frontend, keep as is here if API expects this
	type: z.string().optional(),
	status: z.enum(['active', 'complete', 'failed']).optional(),
	object_id: z.string().optional(),
	label: z.string().optional(), // Note: Frigate uses 'labels' (plural) for filtering

	// Similarity search fields
	search_type: z.enum(['similarity']).optional(), // Only allow 'similarity'
	event_id: z.string().optional(),

	// Common fields
	include_thumbnails: z.number().int().min(0).max(1).optional().default(0),
	timezone: z.string().optional() // Timezone is needed for similarity search
});

export const POST: RequestHandler = async ({ request }) => {
	// console.log(`Received search request: ${request.body}`); // request.body is a stream, log after json()

	if (frigateUrls.length === 0) {
		console.error('No Frigate instances configured.');
		throw error(503, 'Search service unavailable: No Frigate instances configured.');
	}

	try {
		const requestBody = await request.json();
		// Log the raw body *before* parsing if needed for debugging
		// console.log("Raw request body:", JSON.stringify(requestBody));

		const parsedBody = searchSchema.parse(requestBody);
		console.log('Parsed request body:', parsedBody);

		const finalLimit = parsedBody.limit;
		const includeThumbnails = parsedBody.include_thumbnails; // Get from parsed body

		// --- Build the query string based on search type ---
		const queryStringParams = new URLSearchParams();

		if (parsedBody.search_type === 'similarity' && parsedBody.event_id) {
			// --- Similarity Search Query String ---
			console.log(`Building SIMILARITY query for event: ${parsedBody.event_id}`);
			queryStringParams.set('search_type', 'similarity');
			queryStringParams.set('event_id', parsedBody.event_id);
			if (parsedBody.limit !== undefined) {
				queryStringParams.set('limit', parsedBody.limit.toString());
			}
			// Include thumbnails based on request (default is 0 in schema, but frontend sends 1)
			queryStringParams.set('include_thumbnails', includeThumbnails.toString());
			if (parsedBody.timezone) {
				queryStringParams.set('timezone', parsedBody.timezone);
			} else {
				// Optional: Fallback timezone if not provided, though frontend should always send it
				// queryStringParams.set('timezone', 'UTC');
				console.warn('Timezone not provided for similarity search, Frigate might default or error.');
			}

		} else {
			// --- Standard Search Query String ---
			console.log('Building STANDARD search query');
			// Only add 'query' if it's present and not empty
			if (parsedBody.query && parsedBody.query.trim() !== '') {
			    queryStringParams.set("query", parsedBody.query);
			}
			if (parsedBody.limit !== undefined) {
				queryStringParams.set('limit', parsedBody.limit.toString());
			}
			if (parsedBody.cameras && parsedBody.cameras.length > 0) {
				parsedBody.cameras.forEach(camera => {
					queryStringParams.append('cameras', camera);
				});
			}
			if (parsedBody.labels && parsedBody.labels.length > 0) {
				parsedBody.labels.forEach(label => {
					queryStringParams.append('labels', label);
				});
			}
			if (parsedBody.zones && parsedBody.zones.length > 0) {
				parsedBody.zones.forEach(zone => {
					queryStringParams.append('zones', zone);
				});
			}
			if (parsedBody.before !== undefined) {
				// Use the value directly, it's already in seconds from the frontend
				queryStringParams.set('before', parsedBody.before.toString());
			}
			if (parsedBody.after !== undefined) {
				// Use the value directly, it's already in seconds from the frontend
				queryStringParams.set('after', parsedBody.after.toString());
			}
			if (parsedBody.stationary !== undefined) {
				queryStringParams.set('stationary', parsedBody.stationary ? '1' : '0'); // Frigate expects 1 or 0
			}
			// Frontend uses hasSnapshot, but Frigate API uses has_snapshot
			if (parsedBody.hasSnapshot !== undefined) {
                // Correct parameter name for Frigate API
				queryStringParams.set('has_snapshot', parsedBody.hasSnapshot ? '1' : '0'); // Frigate expects 1 or 0
			}
			if (parsedBody.type !== undefined) {
				queryStringParams.set('type', parsedBody.type);
			}
			if (parsedBody.status !== undefined) {
				queryStringParams.set('status', parsedBody.status);
			}
			if (parsedBody.object_id !== undefined) {
				queryStringParams.set('object_id', parsedBody.object_id);
			}
			// Frontend doesn't send 'label' (singular), uses 'labels' (plural)
			// if (parsedBody.label !== undefined) {
			//  queryStringParams.set('label', parsedBody.label);
			// }

			// Always include thumbnails based on request for standard search too
			queryStringParams.set('include_thumbnails', includeThumbnails.toString());

            // Timezone might be useful for Frigate even in standard searches, keep it if sent
			if (parsedBody.timezone) {
				queryStringParams.set('timezone', parsedBody.timezone);
			}
		}


		const forwardedQueryString = queryStringParams.toString();
		console.log(`Forwarding query string: ${forwardedQueryString}`);
		console.log(`Configured Frigate instances: ${frigateUrls.join(', ')}`);

		try {
			// --- Fetch events from all instances concurrently ---
			const fetchPromises = frigateUrls.map(async (baseUrl) => {
				const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/events/search?${forwardedQueryString}`;
				console.log(`Fetching from: ${targetUrl}`);
				try {
					const response = await fetch(targetUrl, {
						method: 'GET', // Search is GET
						headers: {
							'Accept': 'application/json',
						}
					});

					if (!response.ok) {
						// ... (keep existing error handling for individual fetches) ...
						console.error(`Error fetching from ${baseUrl}: ${response.status} ${response.statusText}`);
						const errorBody = await response.text().catch(() => 'Could not read error body');
						console.error(`Error body from ${baseUrl}: ${errorBody}`);
						return null;
					}

					const data: FrigateSearchResponse = await response.json();
					// Add instance identifier
					return data.map(event => ({ ...event, source_instance: baseUrl })) as FrigateEvent[];

				} catch (err: any) {
					console.error(`Network or parsing error fetching from ${baseUrl}: ${err.message}`);
					return null;
				}
			});

			const results = await Promise.all(fetchPromises);

			// --- Collate results ---
			const allEvents: FrigateEvent[] = results
				.filter((result): result is FrigateSearchResponse => result !== null)
				.flat();

			console.log(`Fetched a total of ${allEvents.length} events before sorting and limiting.`);

			// --- Sort aggregated results (most recent first) ---
			const sortedEvents = allEvents.sort((a, b) => (b.start_time ?? 0) - (a.start_time ?? 0));

			// --- Apply final limit ---
			const limitedEvents = sortedEvents.slice(0, finalLimit);

			console.log(`Returning ${limitedEvents.length} events after sorting and limiting.`);
			return json(limitedEvents);

		} catch (err: any) {
			// ... (keep existing aggregated search error handling) ...
			console.error('Error during aggregated Frigate search:', err);
			if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
				return json({ message: (err.body as any)?.message || 'Unknown error' }, { status: err.status as number });
			}
			throw error(500, 'Failed to perform aggregated search.');
		}
	} catch (err: any) {
        // ... (keep existing Zod/general error handling) ...
		if (err instanceof z.ZodError) {
			console.error('Zod validation error:', err.errors);
			return json({ message: 'Invalid request body', errors: err.errors }, { status: 400 });
		} else {
			console.error('Unexpected error during request processing:', err);
			return json({ message: 'Internal server error' }, { status: 500 });
		}
	}
};