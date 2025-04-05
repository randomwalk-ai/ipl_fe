import type { FinalResult } from '../../api/social/+server.js';
import type { TweetsData } from '../types.js';

export const load = async ({ fetch, depends }) => {
	// Add a dependency tag that we can use for invalidation
	depends('social:data');
	
	try {
		const response = await fetch('/api/social');
		const responseJson = (await response.json()) as FinalResult
		return responseJson
	} catch (error) {
		console.error('Error loading tweets data:', error);
		return {
			latestTweets: [],
			totalCount: {
				count: 0,
				positive: 0,
				neutral: 0,
				negative: 0
			},
			ticketCount: 0,
			playerCount: {
				count: 0,
				positive: 0,
				neutral: 0,
				negative: 0
			},
			players: {}
		} as FinalResult;
	}
};