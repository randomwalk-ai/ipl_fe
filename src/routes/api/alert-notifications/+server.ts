import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { alertNotifications, anomaly, loiteringLog ,policeMonitoring} from '$lib/server/db/schema';
import { desc, eq, gt, sql } from 'drizzle-orm';

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
			limit: 200,
			where: gt(loiteringLog.durationSeconds, 120)
		});
		const res4 = await db.query.policeMonitoring.findMany({
			limit: 200,
		});
		// const res3 = await db.execute(sql`
		// 	SELECT * FROM loitering_log
		// 	where duration_seconds > 120
		// 	ORDER BY inserted_at DESC
		// 	LIMIT 200;
		// `);
		const res5 = await db.query.policeMonitoring.findMany({
				limit: 200,
				where: eq(policeMonitoring.is_notified, false)
			});
		console.log('Raw alerts data:', res3);
		// console.log(JSON.stringify(res[0], null, 2));
		return json({
			alertsData: res,
			anomaliesData: res2,
			loiteringData: res3,
			policeMonitoringData: res4,
			policeMonitoringDataRecent: res5
		});
	} catch (error) {
		console.error('Failed to fetch alerts:', error);
		return json([], { status: 500 });
	}
};
