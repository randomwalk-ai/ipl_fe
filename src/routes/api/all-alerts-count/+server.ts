import { db } from "$lib/server/db";
import { alertNotifications, alerts } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { countDistinct, sql } from "drizzle-orm";

export const GET = async () => {
    const result = await db
        .select({
            alertNotifsCount: countDistinct(alertNotifications.alertId), // Corrected distinct usage
        })
        .from(alertNotifications);
    return json(result[0]);
};