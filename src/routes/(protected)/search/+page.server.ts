import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// No initial data to load, search will be performed client-side
	return {};
};
