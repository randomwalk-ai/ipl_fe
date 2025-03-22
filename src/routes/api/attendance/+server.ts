import { db } from "$lib/server/db";
import { gateMonitoring } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { eq, and, max, sum, lte, sql, gte } from "drizzle-orm";

// Function to perform the grouped query
async function getGateMonitoringDataByMinute(
    startTime: Date,
    endTime: Date
): Promise<
    {
        minute: string;
        totalUniqueCount: number;
        totalJerseyYellow: number;
        totalJerseyBlue: number;
        totalJerseyOthers: number; // added to handle totalJerseyOthers
    }[]
> {
    const result = await db
        .select({
            minute: sql`date_trunc('minute', ${gateMonitoring.timestamp})`.as(
                'minute'
            ), // Group by minute
            totalUniqueCount: sql<number>`max(${gateMonitoring.uniqueCount})`.as(
                'total_unique_count'
            ),
            totalJerseyYellow: sql<number>`max(${gateMonitoring.jerseyYellow})`.as(
                'total_jersey_yellow'
            ),
            totalJerseyBlue: sql<number>`max(${gateMonitoring.jerseyBlue})`.as(
                'total_jersey_blue'
            ),
            totalJerseyOthers: sql<number>`max(${gateMonitoring.jerseyOthers})`.as(
                'total_jersey_others'
            ),
        })
        .from(gateMonitoring)
        .where(
            and(
                gte(gateMonitoring.timestamp, startTime.toISOString()),
                lte(gateMonitoring.timestamp, endTime.toISOString())
            )
        )
        .groupBy(sql`date_trunc('minute', ${gateMonitoring.timestamp})`)
        .orderBy(sql`date_trunc('minute', ${gateMonitoring.timestamp})`)
        .execute();

    // Convert the result to the desired format, handling potential null values
    return result.map((row) => ({
        minute: row.minute as string,
        totalUniqueCount: row.totalUniqueCount ?? 0,  // Handle nulls, defaulting to 0
        totalJerseyYellow: row.totalJerseyYellow ?? 0,
        totalJerseyBlue: row.totalJerseyBlue ?? 0,
        totalJerseyOthers: row.totalJerseyOthers ?? 0,
    }));
}

async function queryGateMonitoringData() {
    try {

        const result = await db.execute(sql`WITH minute_buckets AS (
    -- Generate a series of rounded minutes within the data range
    SELECT 
        date_trunc('minute', min(timestamp)) + 
        (INTERVAL '1 minute' * generate_series(0, 
            EXTRACT(EPOCH FROM (date_trunc('minute', max(timestamp)) - 
                               date_trunc('minute', min(timestamp))))/60
        )) AS minute_bucket
    FROM gate_monitoring
),

camera_max_per_minute AS (
    -- For each camera and each minute, get the maximum counts up to that minute
    SELECT 
        mb.minute_bucket,
        gm.camera_id,
        MAX(gm.unique_count) AS max_unique_count,
        MAX(gm.jersey_yellow) AS max_jersey_yellow,
        MAX(gm.jersey_blue) AS max_jersey_blue,
        MAX(gm.jersey_others) AS max_jersey_others
    FROM minute_buckets mb
    CROSS JOIN (SELECT DISTINCT camera_id FROM gate_monitoring) cameras
    LEFT JOIN gate_monitoring gm ON 
        gm.camera_id = cameras.camera_id AND
        gm.timestamp <= mb.minute_bucket
    GROUP BY mb.minute_bucket, gm.camera_id
),

minute_totals AS (
    -- Sum the max values across all cameras for each minute
    SELECT
        minute_bucket,
        SUM(COALESCE(max_unique_count, 0)) AS total_unique_count,
        SUM(COALESCE(max_jersey_yellow, 0)) AS total_jersey_yellow,
        SUM(COALESCE(max_jersey_blue, 0)) AS total_jersey_blue,
        SUM(COALESCE(max_jersey_others, 0)) AS total_jersey_others
    FROM camera_max_per_minute
    GROUP BY minute_bucket
)

-- Final result with running maximums to ensure non-decreasing values
SELECT
    minute_bucket AS "minute",
    MAX(total_unique_count) OVER (ORDER BY minute_bucket) AS "totalUniqueCount",
    MAX(total_jersey_yellow) OVER (ORDER BY minute_bucket) AS "totalJerseyYellow",
    MAX(total_jersey_blue) OVER (ORDER BY minute_bucket) AS "totalJerseyBlue",
    MAX(total_jersey_others) OVER (ORDER BY minute_bucket) AS "totalJerseyOthers"
FROM minute_totals
ORDER BY minute_bucket;`);
        return result as unknown as {
            minute: string;
            totalUniqueCount: number;
            totalJerseyYellow: number;
            totalJerseyBlue: number;
            totalJerseyOthers: number;
        }[]
    } catch (error) {
        console.error("Error querying data:", error);
        throw error;
    }
}


export type AttendanceRetType = {
    attendanceData: Awaited<ReturnType<typeof getGateMonitoringDataByMinute>>;
    oldAttendanceData: Awaited<ReturnType<typeof getGateMonitoringDataByMinute>>;
    allAttendanceData: Awaited<ReturnType<typeof getGateMonitoringDataByMinute>>;
    chartData: Awaited<ReturnType<typeof getGateMonitoringDataByMinute>>;
}

export const GET = async () => {
    let data = await queryGateMonitoringData();
    // // remap all minute string data which is in UTC to local
    // data.forEach((d) => {
    //     d.minute = new Date(d.minute).toLocaleString('en-US', {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: true,
    //         timeZone: 'Asia/Singapore'
    //     })
    // })
    const currentTime = new Date();
    const startTime = new Date(currentTime.getTime() - 60 * 60 * 1000);
    const startTime2 = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);
    const startTime3 = new Date(currentTime.getTime() - 3 * 60 * 60 * 1000);

    // filter out data from the future
    data = data.filter((d) => new Date(d.minute) < currentTime);
    // slice data to last 1 hour
    const attendanceData = data.filter((d) => new Date(d.minute) >= startTime);
    const oldAttendanceData = data.filter((d) => new Date(d.minute) >= startTime2 && new Date(d.minute) < startTime);
    const chartData = data.filter((d) => new Date(d.minute) >= startTime3 && new Date(d.minute) < startTime2);
    const allAttendanceData = data;
    return json({
        attendanceData,
        oldAttendanceData,
        allAttendanceData,
        chartData,
    });
}