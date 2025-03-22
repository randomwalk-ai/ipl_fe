import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Using SQL template literal for direct query since we don't know the schema definition
		const result = await db.query.cameras.findMany();
		return json({ data: result });
	} catch (err) {
		console.error('Error fetching cameras:', err);
		throw error(500, 'Failed to fetch cameras');
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	// Ensure user is authenticated
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { name, url } = await request.json();

		if (!url) {
			throw error(400, 'Camera URL is required');
		}

		// Using SQL template literal for direct query
		const result = await db.execute(sql`
			INSERT INTO cameras (name, url) 
			VALUES (${name || null}, ${url}) 
			RETURNING *
		`);

		return json({ camera: result[0] });
	} catch (err) {
		console.error('Error adding camera:', err);
		throw error(500, 'Failed to add camera');
	}
};
