import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/alerts');
		const alerts = await response.json();

		return {
			alerts
		};
	} catch (error) {
		console.error('Error loading alerts data:', error);
		return {
			alerts: []
		};
	}
};
