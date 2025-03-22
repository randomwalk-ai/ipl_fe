import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { alertNotifications } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		// const res = await fetch('https://29eu3i0mi1l4hg-8000.proxy.runpod.net/alerts-notifications');
		// const alertsData = await res.json();
		const res = await db.select().from(alertNotifications).orderBy(desc(alertNotifications.createdAt)).limit(200)
		// console.log('Raw alerts data:', res);
		// console.log(JSON.stringify(res[0], null, 2));
		return json({
			alertsData: res
		});
	} catch (error) {
		console.error('Failed to fetch alerts:', error);
		return json([], { status: 500 });
	}
};
