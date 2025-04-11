import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { PUBLIC_LOITERING_ENDPOINT, PUBLIC_POLICE_MONITORING_ENDPOINT } from '$env/static/public';

import { alertNotifications, anomaly, loiteringLog, policeMonitoring } from '$lib/server/db/schema';

import { and, desc, eq, gt, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	// const newOnly = url.searchParams.get('newOnly') === 'true';
	// const limit = parseInt(url.searchParams.get('limit') || '1000', 10);

	// console.log('API params:', { newOnly, limit });

	const searchAlertData = await db.execute(sql`
			SELECT 
				*, 
				'data:image/png;base64,' || thumbnail AS thumbnail
			FROM 
			(
				SELECT 
					DISTINCT 
					alert_notifications.id AS id,
					alert_notifications.query AS query,
					result_elem ->> 'id' AS res_id,
					result_elem ->> 'camera' AS camera_id,
					result_elem ->> 'img_url' AS img_url,
					result_elem ->> 'thumb_path' AS thumb_path,
					TO_TIMESTAMP((result_elem ->> 'start_time')::DOUBLE PRECISION) AT TIME ZONE 'UTC' AS start_timestamp,
					TO_TIMESTAMP((result_elem ->> 'end_time')::DOUBLE PRECISION) AT TIME ZONE 'UTC' AS end_timestamp,
					result_elem ->> 'thumbnail' AS thumbnail,
					alert_notifications.is_notified
				FROM alert_notifications,
				LATERAL jsonb_array_elements(alert_notifications.results -> 'results') AS result_elem
				ORDER BY end_timestamp DESC
		) AS sub
		;
		`);

	// Loitering Query
	const loiteringData = await db.execute(sql`
		SELECT 
			*,
			EXTRACT(EPOCH FROM (end_timestamp - start_timestamp)) AS duration
		FROM (
			SELECT 
				id,
				camera_id, 				
				object_class || ' found loitering' AS query,
				${PUBLIC_LOITERING_ENDPOINT} || '/snapshot/' || snapshot_path AS thumb_path,
				loitering_start_time AT TIME ZONE 'UTC' AS start_timestamp,
				created_at AT TIME ZONE 'UTC' AS end_timestamp,
				is_notified
			FROM loitering
		) AS sub
		ORDER BY start_timestamp DESC;	
		`);

	const policeMonitoringData = await db.execute(sql`
		SELECT 
			id,
			camera_id,
			'Missing Police Personnel' AS query,
			from_timestamp AT TIME ZONE 'UTC' AS start_timestamp,
			to_timestamp AT TIME ZONE 'UTC' AS end_timestamp,
			missing_duration as duration,
			${PUBLIC_POLICE_MONITORING_ENDPOINT} || '/snapshot/' || snapshot_path AS thumb_path,
			${PUBLIC_POLICE_MONITORING_ENDPOINT} || '/clip/' || clip_path AS clip_path,
			is_notified
		FROM police_monitoring
		ORDER BY start_timestamp DESC;
	`);

	const uniquesearchAlertData = searchAlertData.filter(
		(alert, index, self) => index === self.findIndex((t) => t.res_id === alert.res_id)
	);

	// Banner Slogans
	const bannerSlogansKeywords = ['person waving black flag','person carrying banners','person carrying bottles','person carrying posters', 'people holding placards'];
	const bannerSlogansData = uniquesearchAlertData.filter((alert) =>
		bannerSlogansKeywords.includes(alert.query as string)
	);

	// Get only unique records based on res_id

	// Animals
	const animalsKeywords = ['dogs','dog'];
	const animalsData = uniquesearchAlertData.filter((alert) =>
		animalsKeywords.includes(alert.query as string)
	);

	const alertData = [
		{
			id: 'banners-slogans',
			count: bannerSlogansData.length,
			details: bannerSlogansData,
			dbIds: searchAlertData
				.filter(
					(alert) =>
						bannerSlogansKeywords.includes(alert.query as string) && alert.is_notified === false
				)
				.map((alert) => alert.id)
		},
		{
			id: 'animals',
			count: animalsData.length,
			details: animalsData,
			dbIds: searchAlertData
				.filter(
					(alert) => animalsKeywords.includes(alert.query as string) && alert.is_notified === false
				)
				.map((alert) => alert.id)
		},
		{
			id: 'loitering',
			count: loiteringData.length,
			details: loiteringData,
			dbIds: loiteringData.filter((alert) => alert.is_notified === false).map((alert) => alert.id)
		},
		{
			id: 'missing-police',
			count: policeMonitoringData.length,
			details: policeMonitoringData,
			dbIds: policeMonitoringData
				.filter((alert) => alert.is_notified === false)
				.map((alert) => alert.id)
		},
		{ id: 'prohibited-items', count: 0, details: [] },
		{ id: 'stampede-risk', count: 0, details: [] },
		{ id: 'fire-smoke', count: 0, details: [] },
		{ id: 'suspect-alert', count: 0, details: [] },
		{ id: 'unattended-baggage', count: 0, details: [] },
		{ id: 'weapons', count: 0, details: [] }
	];
	return json(alertData);
};
