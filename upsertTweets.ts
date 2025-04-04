import { drizzle } from 'drizzle-orm/node-postgres';
import { faker } from '@faker-js/faker';
import { db } from './upsert';
import { tweets } from './src/lib/server/db/schema';

async function seedTweets() {
	const fakeTweets = Array.from({ length: 50 }).map(() => ({
		tweetId: faker.string.uuid(),
		tweetUser: faker.internet.userName(),
		tweetDate: faker.date.past().toISOString(),
		text: faker.lorem.sentence(),
		comments: faker.number.int({ min: 0, max: 500 }),
		retweets: faker.number.int({ min: 0, max: 1000 }),
		quotes: faker.number.int({ min: 0, max: 200 }),
		likes: faker.number.int({ min: 0, max: 5000 }),
		pictures: faker.helpers.arrayElement([null, faker.image.url()]),
		videos: faker.helpers.arrayElement([null, faker.image.url()]),
		gifs: faker.helpers.arrayElement([null, faker.image.url()]),
		category: faker.helpers.arrayElement(['news', 'sports', 'entertainment', 'technology']),
		sentiment: faker.datatype.boolean(),
		input: faker.lorem.sentence()
	}));

	await db.insert(tweets).values(fakeTweets);
	console.log('Seeded tweets successfully!');
}

seedTweets().catch((err) => {
	console.error('Error seeding tweets:', err);
	process.exit(1);
});
