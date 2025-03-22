import { pgTable, serial, varchar, timestamp, integer, boolean, json, doublePrecision, foreignKey, text, jsonb, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gateMonitoring = pgTable("gate_monitoring", {
	id: serial().primaryKey().notNull(),
	cameraId: varchar("camera_id", { length: 50 }).notNull(),
	timestamp: timestamp({ mode: 'string' }).notNull(),
	uniqueCount: integer("unique_count").notNull(),
	jerseyYellow: integer("jersey_yellow").default(0),
	jerseyBlue: integer("jersey_blue").default(0),
	jerseyOthers: integer("jersey_others").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const cameras = pgTable("cameras", {
	id: integer().primaryKey().notNull(),
	name: varchar().notNull(),
	url: varchar().notNull(),
	username: varchar(),
	password: varchar(),
	isConnected: boolean("is_connected"),
	status: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	zonesOfInterest: json("zones_of_interest").default({}),
	resolution: json().default({}),
});

export const analytics = pgTable("analytics", {
	id: serial().primaryKey().notNull(),
	cameraId: integer("camera_id"),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	crowdCount: integer("crowd_count").notNull(),
	density: doublePrecision().notNull(),
	additionalMetrics: json("additional_metrics"),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const alerts = pgTable("alerts", {
	id: varchar({ length: 50 }).primaryKey().notNull(),
	query: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	results: jsonb().default([]),
	intervalSeconds: integer("interval_seconds"),
	cameras: text().array().default([""]),
});

export const alertNotifications = pgTable("alert_notifications", {
	id: varchar().primaryKey().notNull(),
	alertId: varchar("alert_id"),
	query: varchar(),
	results: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
});

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const anomalies = pgTable("anomalies", {
	id: serial().primaryKey().notNull(),
	cameraId: varchar("camera_id", { length: 50 }).notNull(),
	startFrame: integer("start_frame").notNull(),
	endFrame: integer("end_frame").notNull(),
	anomalyCount: integer("anomaly_count").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const anomaly = pgTable("anomaly", {
	id: serial().primaryKey().notNull(),
	cameraId: varchar("camera_id", { length: 50 }).notNull(),
	startFrame: integer("start_frame").notNull(),
	endFrame: integer("end_frame").notNull(),
	anomalyCount: integer("anomaly_count").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});
