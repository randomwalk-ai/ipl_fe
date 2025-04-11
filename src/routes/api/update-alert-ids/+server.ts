import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { unNotifiedAlertIds } = await request.json();

		if (!unNotifiedAlertIds || typeof unNotifiedAlertIds !== 'object') {
			return json(
				{ success: false, message: 'Invalid unNotifiedAlertIds format' },
				{ status: 400 }
			);
		}
		console.log('unNotifiedAlertIds', unNotifiedAlertIds, Object.keys(unNotifiedAlertIds));

		// Update the alert records in the database
		// {"banners-slogans":[],"animals":[],"loitering":[610,609,608,607,606,605,604,603,602,601],"missing-police":[30,29,28,27,26,25,24,23,22,21],"prohibited-items":[],"stampede-risk":[],"fire-smoke":[],"suspect-alert":[],"unattended-baggage":[],"weapons":[]}
		const updatedTableNames = [];
		for (const alertId of Object.keys(unNotifiedAlertIds)) {
			console.log('alertId', alertId);
			if (unNotifiedAlertIds[alertId].length > 0) {
				if (
					[
						'banners-slogans',
						'animals',
						'prohibited-items',
						'stampede-risk',
						'fire-smoke',
						'suspect-alert',
						'unattended-baggage',
						'weapons'
					].includes(alertId)
				) {
					const tableName = 'alert_notifications';
					const ids = unNotifiedAlertIds[alertId];
					console.log('Updating ids', ids, 'for table', tableName);
					const results = await db.execute(
						sql`UPDATE ${sql.identifier(tableName)} SET is_notified = true WHERE id IN (${sql.join(ids, sql`, `)})`
					);
					console.log(`Updated ${results.length} alert records for ${alertId}`);
					updatedTableNames.push(tableName);
				} else if (alertId === 'loitering') {
					const tableName = 'loitering';
					const ids = unNotifiedAlertIds[alertId];
					console.log('Updating ids', ids, 'for table', tableName);
					const results = await db.execute(
						sql`UPDATE ${sql.identifier(tableName)} SET is_notified = true WHERE id IN (${sql.join(ids, sql`, `)})`
					);
					console.log(`Updated ${results.length} alert records for ${alertId}`);
					updatedTableNames.push(tableName);
				} else if (alertId === 'missing-police') {
					const tableName = 'police_monitoring';
					const ids = unNotifiedAlertIds[alertId];
					console.log('Updating ids', ids, 'for table', tableName);
					const results = await db.execute(
						sql`UPDATE ${sql.identifier(tableName)} SET is_notified = true WHERE id IN (${sql.join(ids, sql`, `)})`
					);
					console.log(`Updated ${results.length} alert records for ${alertId}`);
					updatedTableNames.push(tableName);
				}
			}
		}

		return json({
			success: true,
			message: `Updated ${updatedTableNames.length} alert records`,
			updatedTableNames: updatedTableNames
		});
	} catch (error) {
		console.error('Error updating alert notification status:', error);
		return json(
			{
				success: false,
				message: 'Failed to update alert notification status'
			},
			{ status: 500 }
		);
	}
};
