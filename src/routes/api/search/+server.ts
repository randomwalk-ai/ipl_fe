import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { frigateInstances } from '$lib/utils';
import type { FrigateEvent, FrigateSearchResponse } from '../../(protected)/types';
import { z } from 'zod';

const frigateUrls = frigateInstances.map((el) => el.url);

const searchSchema = z.object({
	query: z.string(),
	limit: z.number().int().positive().optional().default(25),
	cameras: z.string().array().optional(), // Changed from comma separated string to array of strings
	labels: z.string().array().optional(),
	zones: z.string().array().optional(),
	before: z.number().optional(),
	after: z.number().optional(),
	stationary: z.boolean().optional(),
	hasSnapshot: z.boolean().optional(),
	// Add other parameters as needed, ensuring types are correct
	// Example for 'type' parameter (assuming it's a string):
	type: z.string().optional(),
	// Example for 'status' parameter (assuming it's a string with limited possible values)
	status: z.enum(['active', 'complete', 'failed']).optional(),

	// You can add more specific validations if necessary, for example, for ID-like strings:
	object_id: z.string().optional(),
	label: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
	console.log(`Received search request: ${request.body}`);

	if (frigateUrls.length === 0) {
		console.error("No Frigate instances configured.");
		throw error(503, 'Search service unavailable: No Frigate instances configured.');
	}

	try {
		const requestBody = await request.json();
		const parsedBody = searchSchema.parse(requestBody);
		console.log("Parsed request body:", parsedBody);

		// --- Parameter Parsing & Defaults (for aggregation logic) ---
		const finalLimit = parsedBody.limit;


		// --- Build the query string ---
		const queryStringParams = new URLSearchParams();
		queryStringParams.set("timezone", "Asia/Calcutta")
		queryStringParams.set("query", parsedBody.query);
		if (parsedBody.limit !== undefined) {
			queryStringParams.set('limit', parsedBody.limit.toString());
		}
		if (parsedBody.cameras) {
			parsedBody.cameras.forEach(camera => {
				queryStringParams.append('cameras', camera); // Append each camera individually
			});
		}
		if (parsedBody.labels) {
			parsedBody.labels.forEach(label => {
				queryStringParams.append('labels', label);
			});
		}
		if (parsedBody.zones) {
			parsedBody.zones.forEach(zone => {
				queryStringParams.append('zones', zone);
			});
		}

		if (parsedBody.before !== undefined) {
			queryStringParams.set('before', parsedBody.before.toString());
		}
		if (parsedBody.after !== undefined) {
			queryStringParams.set('after', parsedBody.after.toString());
		}

		if (parsedBody.stationary !== undefined) {
			queryStringParams.set('stationary', parsedBody.stationary.toString());
		}
		if (parsedBody.hasSnapshot !== undefined) {
			queryStringParams.set('has_snapshot', parsedBody.hasSnapshot.toString()); // Corrected key
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

		if (parsedBody.label !== undefined) {
			queryStringParams.set('label', parsedBody.label);
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
						method: 'GET',
						headers: {
							'Accept': 'application/json',
							// Add any necessary auth headers if your Frigate instances require them
							// 'Authorization': 'Bearer YOUR_TOKEN'
						}
					});

					if (!response.ok) {
						// Log error but don't fail the entire request if one instance is down
						console.error(`Error fetching from ${baseUrl}: ${response.status} ${response.statusText}`);
						const errorBody = await response.text().catch(() => 'Could not read error body');
						console.error(`Error body from ${baseUrl}: ${errorBody}`);
						return null; // Indicate failure for this instance
					}

					const data: FrigateSearchResponse = await response.json();
					// Add instance identifier to each event if needed (optional)
					return data.map(event => ({ ...event, sourceInstance: baseUrl })) as FrigateEvent[]

				} catch (err: any) {
					console.error(`Network or parsing error fetching from ${baseUrl}: ${err.message}`);
					return null; // Indicate failure for this instance
				}
			});

			const results = await Promise.all(fetchPromises);

			// --- Collate results ---
			const allEvents: FrigateEvent[] = results
				.filter((result): result is FrigateSearchResponse => result !== null) // Filter out failed requests
				.flat(); // Combine arrays of events into one array

			console.log(`Fetched a total of ${allEvents.length} events before sorting and limiting.`);

			// --- Sort aggregated results ---
			const sortedEvents = allEvents.sort((a, b) => {
				// Handle potential null/undefined start_time just in case, though unlikely
				const startTimeA = a.start_time ?? 0;
				const startTimeB = b.start_time ?? 0;
				return startTimeB - startTimeA; // Descending order (most recent first)
			});

			// --- Apply limit ---
			const limitedEvents = sortedEvents.slice(0, finalLimit);

			console.log(`Returning ${limitedEvents.length} events after sorting and limiting.`);

			// --- Respond with the aggregated, sorted, and limited results ---
			return json(limitedEvents);

		} catch (err: any) {
			console.error('Error during aggregated Frigate search:', err);
			// Check if it's a SvelteKit error object
			if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
				return json({ message: (err.body as any)?.message || 'Unknown error' }, { status: err.status as number });
			}
			throw error(500, 'Failed to perform aggregated search.');
		}
	} catch (err: any) {
		if (err instanceof z.ZodError) {
			// Handle Zod validation errors
			console.error('Zod validation error:', err.errors);
			return json({ message: 'Invalid request body', errors: err.errors }, { status: 400 });
		} else {
			console.error('Unexpected error during request processing:', err);
			return json({ message: 'Internal server error' }, { status: 500 });
		}
	}
};
