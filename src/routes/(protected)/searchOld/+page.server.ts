import type { CameraType } from '../types';

export const load = async ({ fetch }) => {
	const response = await fetch('/api/all-cameras');
	const responseJson = (await response.json()) as {
		data: CameraType[];
	};
	return {
		cameras: responseJson.data
	};
};
