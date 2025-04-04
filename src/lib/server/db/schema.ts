import {
	pgTable,
	serial,
	varchar,
	timestamp,
	integer,
	boolean,
	json,
	doublePrecision,
	foreignKey,
	text,
	jsonb,
	unique,
	index,
	primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const gateMonitoring = pgTable('gate_monitoring', {
	id: serial().primaryKey().notNull(),
	cameraId: varchar('camera_id', { length: 50 }).notNull(),
	timestamp: timestamp({ mode: 'string' }).notNull(),
	uniqueCount: integer('unique_count').notNull(),
	jerseyYellow: integer('jersey_yellow').default(0),
	jerseyBlue: integer('jersey_blue').default(0),
	jerseyOthers: integer('jersey_others').default(0),
	createdAt: timestamp('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`)
});

export const cameras = pgTable('cameras', {
	id: integer().primaryKey().notNull(),
	name: varchar().notNull(),
	url: varchar().notNull(),
	username: varchar(),
	password: varchar(),
	isConnected: boolean('is_connected'),
	status: varchar(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
	zonesOfInterest: json('zones_of_interest').default({}),
	resolution: json().default({}),
	category: varchar()
});

export const analytics = pgTable('analytics', {
	id: serial().primaryKey().notNull(),
	cameraId: integer('camera_id'),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	crowdCount: integer('crowd_count').notNull(),
	density: doublePrecision().notNull(),
	additionalMetrics: json('additional_metrics')
});

export const alerts = pgTable('alerts', {
	id: varchar({ length: 50 }).primaryKey().notNull(),
	query: text().notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
	results: jsonb().default([]),
	intervalSeconds: integer('interval_seconds'),
	cameras: text().array().default(['']),
	status: varchar()
});

export const alertNotifications = pgTable('alert_notifications', {
	id: varchar().primaryKey().notNull(),
	alertId: varchar('alert_id'),
	query: varchar(),
	results: jsonb(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
});

export const anomaly = pgTable('anomaly', {
	id: serial().primaryKey().notNull(),
	cameraId: integer('camera_id').notNull(),
	startFrame: integer('start_frame').notNull(),
	endFrame: integer('end_frame').notNull(),
	anomalyCount: integer('anomaly_count').notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	filePath: varchar('file_path', { length: 255 })
});

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const loiteringLog = pgTable(
	'loitering_log',
	{
		id: serial().primaryKey().notNull(),
		eventId: varchar('event_id', { length: 50 }).notNull(),
		cameraId: varchar('camera_id', { length: 50 }),
		zone: varchar({ length: 50 }),
		label: varchar({ length: 50 }),
		timestampEntry: timestamp('timestamp_entry', { withTimezone: true, mode: 'string' }).notNull(),
		timestampExit: timestamp('timestamp_exit', { withTimezone: true, mode: 'string' }),
		durationSeconds: doublePrecision('duration_seconds'),
		clipFilename: varchar('clip_filename', { length: 255 }),
		snapshotFilename: varchar('snapshot_filename', { length: 255 }),
		status: varchar({ length: 15 }).default('active'),
		insertedAt: timestamp('inserted_at', { withTimezone: true, mode: 'string' }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
	},
	(table) => [
		index('idx_loitering_log_object_id_status').using(
			'btree',
			table.eventId.asc().nullsLast().op('text_ops'),
			table.status.asc().nullsLast().op('text_ops')
		),
		index('idx_loitering_log_status').using('btree', table.status.asc().nullsLast().op('text_ops')),
		index('idx_loitering_log_timestamp_entry').using(
			'btree',
			table.timestampEntry.asc().nullsLast().op('timestamptz_ops')
		)
	]
);

export const tweets = pgTable("tweets", {
	tweetId: text("tweet_id").primaryKey().notNull(),
	tweetUser: text("tweet_user"),
	tweetDate: timestamp("tweet_date", { mode: 'string' }),
	text: text(),
	comments: integer(),
	retweets: integer(),
	quotes: integer(),
	likes: integer(),
	pictures: text(),
	videos: text(),
	gifs: text(),
	category: text().$type<"ticket" | "player">(),
	sentiment: text().$type<"positive" | "negative" | "neutral">(),
	input: text(),
});
