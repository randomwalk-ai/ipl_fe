import { relations } from "drizzle-orm/relations";
import { account, anomaly, session, user, cameras } from "./schema";

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const anomalyRelations = relations(anomaly, ({ one }) => ({
	camera: one(cameras, {
		fields: [anomaly.cameraId],
		references: [cameras.id]
	}),
}));

export const cameraRelations = relations(cameras, ({ many }) => ({
	anomalies: many(anomaly),
}));