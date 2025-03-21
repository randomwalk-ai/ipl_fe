import { db } from "$lib/server/db";
import { gateMonitoring } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { sql, and, gte, lte } from 'drizzle-orm';

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
            totalUniqueCount: sql<number>`sum(${gateMonitoring.uniqueCount})`.as(
                'total_unique_count'
            ),
            totalJerseyYellow: sql<number>`sum(${gateMonitoring.jerseyYellow})`.as(
                'total_jersey_yellow'
            ),
            totalJerseyBlue: sql<number>`sum(${gateMonitoring.jerseyBlue})`.as(
                'total_jersey_blue'
            ),
            totalJerseyOthers: sql<number>`sum(${gateMonitoring.jerseyOthers})`.as(
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
        minute: (row.minute as unknown as Date).toISOString(), // Cast to Date then string (critical for correct formatting)
        totalUniqueCount: row.totalUniqueCount ?? 0,  // Handle nulls, defaulting to 0
        totalJerseyYellow: row.totalJerseyYellow ?? 0,
        totalJerseyBlue: row.totalJerseyBlue ?? 0,
        totalJerseyOthers: row.totalJerseyOthers ?? 0,
    }));
}

export type AttendanceRetType = {
    attendanceData: Awaited<ReturnType<typeof getGateMonitoringDataByMinute>>;
    oldAttendanceData: Awaited<ReturnType<typeof getGateMonitoringDataByMinute>>;
    allAttendanceData: Awaited<ReturnType<typeof getGateMonitoringDataByMinute>>;
}

export const GET = async () => {
    const currentTime = new Date();
    // 1 hours prior
    const startTime = new Date(currentTime.getTime() - 60 * 60 * 1000);
    // 2 hours prior
    const startTime2 = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);
    // 48 hours prior
    const startTime3 = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000);
    const attendanceData = await getGateMonitoringDataByMinute(startTime, currentTime);
    const oldAttendanceData = await getGateMonitoringDataByMinute(startTime2, currentTime);
    const allAttendanceData = await getGateMonitoringDataByMinute(startTime3, currentTime);
    return json({
        attendanceData,
        oldAttendanceData,
        allAttendanceData,
    });
}