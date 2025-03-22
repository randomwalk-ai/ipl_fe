import { relations } from "drizzle-orm/relations";
import { cameras, detections, analytics, user, account, session } from "./schema";

export const detectionsRelations = relations(detections, ({one}) => ({
	camera: one(cameras, {
		fields: [detections.cameraId],
		references: [cameras.id]
	}),
}));

export const camerasRelations = relations(cameras, ({many}) => ({
	detections: many(detections),
	analytics: many(analytics),
}));

export const analyticsRelations = relations(analytics, ({one}) => ({
	camera: one(cameras, {
		fields: [analytics.cameraId],
		references: [cameras.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));