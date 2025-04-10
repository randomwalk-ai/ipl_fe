import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { alertNotifications, anomaly, loiteringLog, policeMonitoring } from '$lib/server/db/schema';
import { and, desc, eq, gt, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const showAllAlerts = url.searchParams.get('showAllAlerts');
		console.log('showAllAlerts in server', showAllAlerts, showAllAlerts === 'false');

		const searchAlertData = await db.query.alertNotifications.findMany({
			where: showAllAlerts === 'false' ? eq(alertNotifications.isNotified, false) : undefined,
			orderBy: desc(alertNotifications.createdAt),
			limit: 200
		});

		const searchAnomalyData = await db.query.anomaly.findMany({
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

		const searchLoiteringData = await db.query.loiteringLog.findMany({
			orderBy: desc(loiteringLog.insertedAt),
			limit: 200,
			where:
				showAllAlerts === 'false'
					? and(gt(loiteringLog.durationSeconds, 120), eq(loiteringLog.isNotified, false))
					: undefined
		});

		const searchPoliceMonitoringData = await db.query.policeMonitoring.findMany({
			limit: 200,
			orderBy: desc(policeMonitoring.createdAt),
			where: showAllAlerts === 'false' ? eq(policeMonitoring.isNotified, false) : undefined
		});
		// console.log('searchPoliceMonitoringData', searchPoliceMonitoringData);

		return json({
			alertsData: searchAlertData,
			anomaliesData: searchAnomalyData,
			loiteringData: searchLoiteringData,
			policeMonitoringData: searchPoliceMonitoringData
		});
	} catch (error) {
		console.error('Failed to fetch alerts:', error);
		return json([], { status: 500 });
	}
};
