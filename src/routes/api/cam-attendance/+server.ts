import { db } from '$lib/server/db';
import { gateMonitoring, cameras } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

// Updated type definition for the camera data
export type CameraData = {
	camera_id: string;
	camera_name: string; // Added camera name
	max_unique_count: number;
	max_jersey_yellow: number;
	max_jersey_blue: number;
	max_jersey_others: number;
};

// Type definition for the grouped minute data
export type MinuteGroupedData = {
	minute_bucket: string;
	cameras: CameraData[];
};

/**
 * Fetches gate monitoring data for only the latest minute with nested camera information
 */
async function getGateMonitoringDataByMinuteWithCameras(): Promise<MinuteGroupedData[]> {
	try {
		const result = await db.execute(sql`
            WITH minute_buckets AS (
                -- Generate a series of rounded minutes within the data range
                SELECT 
                    date_trunc('minute', min(timestamp)) + 
                    (INTERVAL '1 minute' * generate_series(0, 
                        EXTRACT(EPOCH FROM (date_trunc('minute', max(timestamp)) - 
                                          date_trunc('minute', min(timestamp))))/60
                    )) AS minute_bucket
                FROM gate_monitoring
            ),
            all_cameras AS (
                -- Get a distinct list of all camera IDs that appear in the data
                SELECT DISTINCT gm.camera_id, c.name as camera_name
                FROM gate_monitoring gm
                LEFT JOIN cameras c ON gm.camera_id = c.id::text
                WHERE gm.camera_id IS NOT NULL
            ),
            camera_max_per_minute AS (
                -- For each camera and each minute, get the maximum counts up to that minute
                SELECT 
                    mb.minute_bucket,
                    ac.camera_id,
                    ac.camera_name,
                    COALESCE(MAX(gm.unique_count), 0) AS max_unique_count,
                    COALESCE(MAX(gm.jersey_yellow), 0) AS max_jersey_yellow,
                    COALESCE(MAX(gm.jersey_blue), 0) AS max_jersey_blue,
                    COALESCE(MAX(gm.jersey_others), 0) AS max_jersey_others
                FROM minute_buckets mb
                CROSS JOIN all_cameras ac
                LEFT JOIN gate_monitoring gm ON 
                    gm.camera_id = ac.camera_id AND
                    gm.timestamp <= mb.minute_bucket
                GROUP BY mb.minute_bucket, ac.camera_id, ac.camera_name
            )
            -- Create nested JSON with cameras grouped by minute
            SELECT 
                minute_bucket,
                jsonb_agg(
                    jsonb_build_object(
                        'camera_id', camera_id,
                        'camera_name', camera_name,
                        'max_unique_count', 
                        CASE 
                            WHEN camera_name = 'DLower29' THEN LEAST(CEIL(2200*1.05), max_unique_count)
                            WHEN camera_name = 'KLower19' THEN LEAST(CEIL(2251*1.05), max_unique_count)
                            WHEN camera_name = 'GUpper24' THEN LEAST(CEIL(1776*1.05), max_unique_count)
                            ELSE max_unique_count
                        END,
                        'max_jersey_yellow', max_jersey_yellow,
                        'max_jersey_blue', max_jersey_blue,
                        'max_jersey_others', max_jersey_others
                    )
                ) AS cameras
            FROM camera_max_per_minute
            GROUP BY minute_bucket
            ORDER BY minute_bucket DESC
            LIMIT 1
        `);

		return result as unknown as MinuteGroupedData[];
	} catch (error) {
		console.error('Error querying camera data by minute:', error);
		throw error;
	}
}

export type CameraDataRetType = {
	cameraData: MinuteGroupedData[];
	timestamp: string;
};

export const GET = async () => {
	try {
		const data = await getGateMonitoringDataByMinuteWithCameras();

		return json({
			cameraData: data,
			timestamp: new Date().toISOString()
		} as CameraDataRetType);
	} catch (error) {
		console.error('Error in camera data endpoint:', error);
		return json({ error: 'Failed to fetch camera data' }, { status: 500 });
	}
};
