import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { alertNotifications, anomaly, loiteringLog } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		const res = await db.query.alertNotifications.findMany({
			orderBy: desc(alertNotifications.createdAt),
			limit: 200
		});
		// const res2 = await db.select().from(anomaly).orderBy(desc(anomaly.createdAt)).limit(200);
		const res2 = await db.query.anomaly.findMany({
			orderBy: desc(anomaly.createdAt),
			limit: 200,
			with: {
				camera: {
					columns: {
						id: true,
						name: true
					}
				}
			}
		});
		const res3 = await db.query.loiteringLog.findMany({
			orderBy: desc(loiteringLog.insertedAt),
			limit: 200
		});
		// console.log('Raw alerts data:', res);
		// console.log(JSON.stringify(res[0], null, 2));
		return json({
			alertsData: res,
			anomaliesData: res2,
			loiteringData: res3
		});
	} catch (error) {
		console.error('Failed to fetch alerts:', error);
		return json([], { status: 500 });
	}
};
