import { db } from "$lib/server/db";
import { tweets } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
// Removed isNotNull as it wasn't used directly after previous edits
import { count, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

type Tweet = typeof tweets.$inferSelect;

// No changes needed for PlayerDetail
type PlayerDetail = {
    stats: {
        count: number;
        positive: number;
        neutral: number;
        negative: number;
    };
    tweets: Tweet[];
};

// --- Updated FinalResult type ---
export type FinalResult = {
    latestTweets: Tweet[];
    totalCount: { // Changed structure
        count: number;
        positive: number;
        neutral: number;
        negative: number;
    };
    ticketCount: number; // Remains the same
    playerCount: { // Added field with structure
        count: number;
        positive: number;
        neutral: number;
        negative: number;
    };
    players: Record<string, PlayerDetail>;
};

// --- Constants ---
const LATEST_TWEET_LIMIT = 60;
const PLAYER_TWEET_LIMIT = 20;

// --- The Data Fetching Function ---
async function getTweets(): Promise<FinalResult> {

    const result = await db.transaction(async (tx) => {

        // 1. Fetch Overall Latest Tweets (No change)
        const latestTweetsPromise = tx
            .select()
            .from(tweets)
            .orderBy(desc(tweets.tweetDate))
            .limit(LATEST_TWEET_LIMIT);

        // 2. Fetch Total Tweet Count and Sentiments (Modified)
        const totalStatsPromise = tx
            .select({
                total: count().as('total_count'),
                positive: count(sql`CASE WHEN ${tweets.sentiment} = 'positive' THEN 1 END`).as('positive_count'),
                negative: count(sql`CASE WHEN ${tweets.sentiment} = 'negative' THEN 1 END`).as('negative_count'),
                neutral: count(sql`CASE WHEN ${tweets.sentiment} = 'neutral' THEN 1 END`).as('neutral_count'),
            })
            .from(tweets); // Aggregates across all tweets

        // 3. Fetch Ticket Category Count (No change)
        const ticketCountPromise = tx
            .select({ value: count() })
            .from(tweets)
            .where(eq(tweets.category, "ticket"));

        // 4. Fetch Player Statistics (Aggregated per Player) (No change)
        // This is still needed for the 'players' object breakdown
        const playerStatsPromise = tx
            .select({
                playerInput: tweets.input,
                total: count().as('total_count'),
                positive: count(sql`CASE WHEN ${tweets.sentiment} = 'positive' THEN 1 END`).as('positive_count'),
                negative: count(sql`CASE WHEN ${tweets.sentiment} = 'negative' THEN 1 END`).as('negative_count'),
                neutral: count(sql`CASE WHEN ${tweets.sentiment} = 'neutral' THEN 1 END`).as('neutral_count'),
            })
            .from(tweets)
            .where(eq(tweets.category, "player"))
            .groupBy(tweets.input)
            .having(sql`${tweets.input} IS NOT NULL`);

        // 5. Fetch Player Tweet Count and Sentiments (New)
        // This is for the top-level 'playerCount' object
        const playerOverallStatsPromise = tx
             .select({
                 total: count().as('total_count'),
                 positive: count(sql`CASE WHEN ${tweets.sentiment} = 'positive' THEN 1 END`).as('positive_count'),
                 negative: count(sql`CASE WHEN ${tweets.sentiment} = 'negative' THEN 1 END`).as('negative_count'),
                 neutral: count(sql`CASE WHEN ${tweets.sentiment} = 'neutral' THEN 1 END`).as('neutral_count'),
             })
             .from(tweets)
             .where(eq(tweets.category, "player")); // Only player tweets


        // 6. Fetch All Player Tweets (Ordered for later processing) (No change)
        const allPlayerTweetsPromise = tx
            .select()
            .from(tweets)
            .where(eq(tweets.category, "player"))
            .orderBy(desc(tweets.tweetDate));


        // --- Execute all queries concurrently ---
        const [
            latestTweetsResult,
            totalStatsResult, // Updated name
            ticketCountResult,
            playerStatsResult, // Stats per player
            playerOverallStatsResult, // New: Overall stats for players
            allPlayerTweetsResult
        ] = await Promise.all([
            latestTweetsPromise,
            totalStatsPromise, // Updated promise
            ticketCountPromise,
            playerStatsPromise,
            playerOverallStatsPromise, // Added promise
            allPlayerTweetsPromise
        ]);

        // --- Process Results ---

        // Process Total Stats
        const totalStats = totalStatsResult[0] ?? { total: 0, positive: 0, neutral: 0, negative: 0 };
        const totalCount = {
            count: Number(totalStats.total),
            positive: Number(totalStats.positive),
            neutral: Number(totalStats.neutral),
            negative: Number(totalStats.negative)
        };

        // Process Ticket Count
        const ticketCount = ticketCountResult[0]?.value ?? 0;

        // Process Overall Player Stats
        const playerOverallStats = playerOverallStatsResult[0] ?? { total: 0, positive: 0, neutral: 0, negative: 0 };
        const playerCount = {
             count: Number(playerOverallStats.total),
             positive: Number(playerOverallStats.positive),
             neutral: Number(playerOverallStats.neutral),
             negative: Number(playerOverallStats.negative)
        };

        // Process Latest Tweets
        const latestTweets = latestTweetsResult;

        // Process Individual Player Data (No change in logic here)
        const players: Record<string, PlayerDetail> = {};
        for (const stat of playerStatsResult) {
            if (stat.playerInput) {
                 players[stat.playerInput] = {
                    stats: {
                        count: Number(stat.total),
                        positive: Number(stat.positive),
                        neutral: Number(stat.neutral),
                        negative: Number(stat.negative),
                    },
                    tweets: [],
                };
            }
        }

        const playerTweetCounts: Record<string, number> = {};
        for (const tweet of allPlayerTweetsResult) {
            const playerInput = tweet.input;
            if (playerInput && players[playerInput]) {
                if (playerTweetCounts[playerInput] === undefined) {
                    playerTweetCounts[playerInput] = 0;
                }
                if (playerTweetCounts[playerInput] < PLAYER_TWEET_LIMIT) {
                    players[playerInput].tweets.push(tweet);
                    playerTweetCounts[playerInput]++;
                }
            }
        }

        // --- Assemble Final Result (Updated Structure) ---
        const finalResult: FinalResult = {
            latestTweets: latestTweets,
            totalCount: totalCount, // Use the processed object
            ticketCount: ticketCount,
            playerCount: playerCount, // Use the new processed object
            players: players,
        };

        return finalResult;
    }); // End of transaction

    return result;
}

// --- GET Handler (no changes needed here) ---
export async function GET() {
    try {
        const tweetsData = await getTweets();
        return json(tweetsData);
    } catch (error) {
        console.error("Error in GET /api/tweets:", error);
        return json({ error: "Failed to fetch tweet data" }, { status: 500 });
    }
}