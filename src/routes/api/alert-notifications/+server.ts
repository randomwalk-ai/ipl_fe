import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const res = await fetch('https://29eu3i0mi1l4hg-8000.proxy.runpod.net/alerts-notifications');
		const alertsData = await res.json();
		// console.log(alertsData);
		return json(alertsData);
	} catch (error) {
		console.error('Failed to fetch alerts:', error);
		return json([], { status: 500 });
	}
};
