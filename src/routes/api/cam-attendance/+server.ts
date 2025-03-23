import { db } from "$lib/server/db";
import { gateMonitoring } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

// Type definition for the camera data
export type CameraData = {
    camera_id: string;
    max_unique_count: number;
    max_jersey_yellow: number;
    max_jersey_blue: number;
    max_jersey_others: number;
}

// Type definition for the grouped minute data
export type MinuteGroupedData = {
    minute_bucket: string;
    cameras: CameraData[];
}

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
                SELECT DISTINCT camera_id 
                FROM gate_monitoring
                WHERE camera_id IS NOT NULL
            ),
            camera_max_per_minute AS (
                -- For each camera and each minute, get the maximum counts up to that minute
                SELECT 
                    mb.minute_bucket,
                    ac.camera_id,
                    COALESCE(MAX(gm.unique_count), 0) AS max_unique_count,
                    COALESCE(MAX(gm.jersey_yellow), 0) AS max_jersey_yellow,
                    COALESCE(MAX(gm.jersey_blue), 0) AS max_jersey_blue,
                    COALESCE(MAX(gm.jersey_others), 0) AS max_jersey_others
                FROM minute_buckets mb
                CROSS JOIN all_cameras ac
                LEFT JOIN gate_monitoring gm ON 
                    gm.camera_id = ac.camera_id AND
                    gm.timestamp <= mb.minute_bucket
                GROUP BY mb.minute_bucket, ac.camera_id
            )
            -- Create nested JSON with cameras grouped by minute
            SELECT 
                minute_bucket,
                jsonb_agg(
                    jsonb_build_object(
                        'camera_id', camera_id,
                        'max_unique_count', max_unique_count,
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
        console.error("Error querying camera data by minute:", error);
        throw error;
    }
}

export type CameraDataRetType = {
    cameraData: MinuteGroupedData[];
    timestamp: string;
}

export const GET = async () => {
    try {
        const data = await getGateMonitoringDataByMinuteWithCameras();
        
        // No need to filter anymore since we're only returning the latest minute
        // But keeping the timestamp logic for consistency
        
        return json({
            cameraData: data,
            timestamp: new Date().toISOString()
        } as CameraDataRetType);
    } catch (error) {
        console.error("Error in camera data endpoint:", error);
        return json({ error: "Failed to fetch camera data" }, { status: 500 });
    }
};