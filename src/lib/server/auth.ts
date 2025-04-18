import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
// import { PUBLIC_APP_NAME, PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	appName: env.PUBLIC_APP_NAME,
	baseURL: env.PUBLIC_BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: 'pg', // or "mysql", "sqlite",
		schema
	}),
	emailAndPassword: {
		enabled: true
	},
	account: {
		accountLinking: {
			enabled: true
		}
	},
	trustedOrigins: [
		'http://localhost:5173', 'https://macalerts.randomwalk.ai']
});