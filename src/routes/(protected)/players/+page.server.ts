import type { TweetsData } from '../types.js';

export const load = async ({ fetch }) => {
	try {
		const response = await fetch('/api/social');
		const responseJson = (await response.json()) as {
			tweets: TweetsData[];
			totalCount: number;
		};
		return {
			tweets: responseJson.tweets,
			totalCount: responseJson.totalCount
		};
	} catch (error) {
		console.error('Error loading tweets data:', error);
		return {
			tweets: [],
			totalCount: 0
		};
	}
};