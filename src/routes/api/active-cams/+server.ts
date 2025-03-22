import { json } from "@sveltejs/kit";
import { eq, sql } from 'drizzle-orm';
import { db } from "$lib/server/db";
import { cameras } from "$lib/server/db/schema";

async function getConnectedCameraCount() {
    const result = await db
        .select({
            count: sql<number>`count(distinct ${cameras.id})`,
        })
        .from(cameras)
        .where(eq(cameras.isConnected, true));

    // result[0].count will contain the count
    return result[0].count;
}

export const GET = async () => {
    const data = await getConnectedCameraCount();
    return json({
        activeCamCount: data
    })
};