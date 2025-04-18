import type { CameraType } from '../types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/cameras');
		const responseJson = await response.json() as {
			data: CameraType[]
		};
		return {
			cameras: responseJson.data
		};
	} catch (error) {
		console.error('Error loading cameras data:', error);
		return {
			cameras: []
		};
	}
};
