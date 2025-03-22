import {
	pgTable,
	index,
	foreignKey,
	serial,
	integer,
	timestamp,
	varchar,
	json,
	doublePrecision,
	boolean,
	text,
	unique
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const cameras = pgTable(
	'cameras',
	{
		id: serial().primaryKey().notNull(),
		name: varchar().notNull(),
		url: varchar().notNull(),
		username: varchar(),
		password: varchar(),
		isConnected: boolean('is_connected'),
		status: varchar(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		zonesOfInterest: json('zones_of_interest').default({}),
		resolution: json().default({})
	},
	(table) => [index('ix_cameras_id').using('btree', table.id.asc().nullsLast().op('int4_ops'))]
);

export const verification = pgTable('verification', {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }),
	updatedAt: timestamp('updated_at', { mode: 'string' })
});

export const user = pgTable(
	'user',
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean('email_verified').notNull(),
		image: text(),
		createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).notNull()
	},
	(table) => [unique('user_email_unique').on(table.email)]
);

export const account = pgTable(
	'account',
	{
		id: text().primaryKey().notNull(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id').notNull(),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'string' }),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'string' }),
		scope: text(),
		password: text(),
		createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'account_user_id_user_id_fk'
		})
	]
);

export const session = pgTable(
	'session',
	{
		id: text().primaryKey().notNull(),
		expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
		token: text().notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id').notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: 'session_user_id_user_id_fk'
		}),
		unique('session_token_unique').on(table.token)
	]
);

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
