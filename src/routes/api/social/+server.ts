import { db } from "$lib/server/db";
import { tweets } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

async function getTweets() {
    // Get the limited tweets
    const result = await db
        .select({
            tweetId: tweets.tweetId,
            tweetUser: tweets.tweetUser,
            tweetDate: tweets.tweetDate,
            text: tweets.text,
            retweets: tweets.retweets,
            likes: tweets.likes,
            category: tweets.category,
            sentiment: tweets.sentiment,
            input: tweets.input,
        })
        .from(tweets)
        .execute();

    // Get the total count in a separate query
    const countResult = await db
        .select({ count: sql`count(*)` })
        .from(tweets)
        .execute();

    // Return both the tweets and the total count
    return {
        tweets: result,
        totalCount: Number(countResult[0].count)
    };
}

export async function GET() {
    try {
        const tweetsData = await getTweets();
        return json(tweetsData);
    } catch (error) {
        console.error("Error fetching tweets:", error);
        return json({ error: "Failed to fetch tweets" }, { status: 500 });
    }
}