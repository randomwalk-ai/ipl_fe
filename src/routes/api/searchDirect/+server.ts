// src/routes/api/events/search/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { frigateInstances } from '$lib/utils'; // Ensure this path and structure are correct
import type { FrigateEvent } from '../../(protected)/types'; // Adjust path if needed

// Define the structure expected from the FastAPI semantic search service
interface EventMetadata { // Renamed from EventMetdata for consistency
    box?: number[]; // Optional: Allow missing fields
    region?: number[]; // Optional
    score?: number; // Optional
    top_score?: number; // Optional
    attributes?: any[]; // Optional
    type?: string; // Optional
    max_severity?: string; // Optional
}

interface EventDetail {
    id: string;
    camera: string;
    label: string;
    start_time: number;
    end_time: number;
    has_clip: boolean;
    has_snapshot: boolean;
    search_distance: number; // Distance metric from vector search (lower is more similar)
    search_confidence: number; // Similarity confidence (0-100), added by FastAPI
    thumbnail: string; // Base64 encoded thumbnail string
    data: Optional<EventMetadata>; // Using Optional to handle potential null/parsing errors
}

// Helper type for optional fields from JSON parsing
type Optional<T> = T | null | undefined;

// --- Helper Function to map EventDetail to FrigateEvent-like structure ---
function mapEventDetailToFrigateEvent(detail: EventDetail, instanceFrigateUrl: string): FrigateEvent {
    // Use the base64 thumbnail directly if the frontend can handle it (e.g., in an <img> src)
    const thumbnailSrc = `data:image/jpeg;base64,${detail.thumbnail}`;

    return {
        id: detail.id,
        camera: detail.camera,
        label: detail.label,
        start_time: detail.start_time,
        end_time: detail.end_time ?? detail.start_time + 1, // Add fallback for end_time if missing
        has_clip: detail.has_clip,
        has_snapshot: detail.has_snapshot,
        source_instance: instanceFrigateUrl, // Identify which *Frigate* instance it came from
        search_distance: detail.search_distance,
        search_confidence: detail.search_confidence, // Pass confidence through
        zones: [], // Semantic search doesn't return zones
        thumbnail: thumbnailSrc, // Use the base64 data URI
        sub_label: null, // Not available from semantic search details
        thumb_path: thumbnailSrc, // Use base64 data URI; frontend needs to handle this
        // Use data from the parsed 'data' field if available
        top_score: detail.data?.top_score ?? null, // Map top_score if present
        score: detail.data?.score ?? null, // Map score if present
        search_source: 'semantic', // Indicate this is from semantic search
        data: {
            // Include key metadata if present
            score: detail.data?.score ?? -1,
            top_score: detail.data?.top_score ?? -1,
            type: detail.data?.type ?? 'semantic_match', // Provide a default type if missing
            box: detail.data?.box,
            region: detail.data?.region,
            attributes: detail.data?.attributes,
        },
        plus_id: null, // Not available
        // Add any other fields expected by your FrigateEvent type with default/null values
        model_hash: '', // Example default
        detector_type: '', // Example default
        model_type: '', // Example default
        retain_indefinitely: false, // Example default
        ratio: 1, // Example default
        stationary: false, // Semantic search doesn't provide this directly
        motionless_count: 0, // Example default
        position_changes: 0, // Example default
        current_zones: [], // Example default
        entered_zones: [], // Example default
        false_positive: null, // Example default
    };
}


export const POST: RequestHandler = async ({ request }) => {
    console.log(`Received search request - routing ALL to semantic search endpoint...`);

    if (frigateInstances.length === 0) {
        console.error('No Frigate instances configured.');
        throw error(503, 'Search service unavailable: No Frigate instances configured.');
    }

    let requestData: FormData;
    try {
        // All searches now might include an image, so expect multipart/form-data
        requestData = await request.formData();
        console.log("Received FormData keys:", Array.from(requestData.keys()));
    } catch (e) {
        console.error('Failed to parse request body as FormData:', e);
        throw error(400, 'Invalid request format. Expected multipart/form-data.');
    }

    // --- Extract Parameters relevant to the FastAPI Semantic Search Endpoint ---
    const query = requestData.get('query')?.toString() || undefined; // Text query
    const imageFile = requestData.get('image'); // Image file (File or null)

    // Parameters supported by the FastAPI endpoint
    const limitStr = requestData.get('limit')?.toString();
    const limit = limitStr ? parseInt(limitStr, 10) : 100; // Default limit matches FastAPI
    const camerasStr = requestData.get('cameras')?.toString() || 'all';
    const labelsStr = requestData.get('labels')?.toString() || 'all';
    const afterStr = requestData.get('after')?.toString();
    const after = afterStr ? parseFloat(afterStr) : undefined;
    const beforeStr = requestData.get('before')?.toString();
    const before = beforeStr ? parseFloat(beforeStr) : undefined;
    const minConfidenceStr = requestData.get('min_confidence')?.toString();
    const min_confidence = minConfidenceStr ? parseFloat(minConfidenceStr) : 0.0; // Default 0
    const maxDistanceStr = requestData.get('max_distance')?.toString(); // *** NEW: Extract max_distance ***
    const max_distance = maxDistanceStr ? parseFloat(maxDistanceStr) : undefined; // *** NEW: Parse to float or undefined ***
    const sort = requestData.get('sort')?.toString() || 'score_desc'; // Default sort matches FastAPI

    // --- Log parameters NOT directly supported by the FastAPI endpoint (for debugging/info) ---
    const unsupportedParams: Record<string, any> = {};
    const checkUnsupported = (key: string) => {
        const value = requestData.get(key);
        if (value !== null && value !== undefined) unsupportedParams[key] = value;
    };
    checkUnsupported('zones');
    checkUnsupported('stationary');
    checkUnsupported('hasSnapshot');
    checkUnsupported('type');
    checkUnsupported('status');
    checkUnsupported('object_id');
    checkUnsupported('min_score'); // Use 'min_confidence' instead
    checkUnsupported('include_thumbnails');
    checkUnsupported('timezone');

    if (Object.keys(unsupportedParams).length > 0) {
        console.warn('Received parameters not directly used by the semantic search endpoint:', unsupportedParams);
        console.warn("Filters like zones, stationary, type, status, object_id are NOT applied by the semantic search.");
        console.warn("Use 'min_confidence' (0-100) and optionally 'max_distance' (float >= 0) instead of 'min_score'."); // Updated warning
    }

    // *** Updated log to include max_distance ***
    console.log('Parameters for Semantic Search:', { query, hasImage: !!imageFile, limit, camerasStr, labelsStr, after, before, min_confidence, max_distance, sort });

    // --- Perform Semantic Search using FastAPI Services ---
    if (!query && !(imageFile instanceof File && imageFile.size > 0)) {
        throw error(400, 'Search requires either a "query" text field or a non-empty "image" file.');
    }
    if (query && imageFile instanceof File && imageFile.size > 0) {
        throw error(400, 'Search requires EITHER "query" text OR an "image" file, not both.');
    }

    const fetchPromises = frigateInstances.map(async (instance) => {
        if (!instance.semanticUrl) {
            console.warn(`Semantic search URL not configured for instance: ${instance.name || instance.url}. Skipping.`);
            return null; // Skip instance if no semantic URL
        }
        // Use the Frigate instance URL for mapping back, even if searching via semantic URL
        const instanceFrigateUrl = instance.url || `semantic-instance-${instance.name || 'unknown'}`;

        const targetUrl = `${instance.semanticUrl.replace(/\/$/, '')}/search`;
        const formData = new FormData();

        // Append search criteria (text or image)
        if (query) {
            formData.append('query', query);
        } else if (imageFile instanceof File) {
            formData.append('image', imageFile, imageFile.name);
        }

        // Append filters supported by FastAPI
        formData.append('limit', limit.toString()); // FastAPI expects limit
        formData.append('cameras', camerasStr);
        formData.append('labels', labelsStr);
        if (after !== undefined) formData.append('after', after.toString());
        if (before !== undefined) formData.append('before', before.toString());
        formData.append('min_confidence', min_confidence.toString());
        if (max_distance !== undefined) { // *** NEW: Conditionally append max_distance ***
            formData.append('max_distance', max_distance.toString());
        }
        formData.append('sort', sort); // Pass the sort option

        console.log(`Fetching from SEMANTIC endpoint: ${targetUrl} for instance ${instance.name || instanceFrigateUrl}`);
        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
                // No 'Content-Type' header needed for FormData; fetch sets it automatically with boundary
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => 'Could not read error body');
                console.error(`Error fetching from ${targetUrl}: ${response.status} ${response.statusText}. Body: ${errorBody}`);
                // Optionally try to parse JSON error from FastAPI
                try {
                    const errorJson = JSON.parse(errorBody);
                    if (errorJson.detail) {
                        console.error(`FastAPI Error Detail: ${errorJson.detail}`);
                    }
                } catch (_) { /* ignore json parsing error */ }
                return null; // Indicate failure for this instance
            }

            const data: EventDetail[] = await response.json();
            console.log(`Received ${data.length} results from ${targetUrl}`);

            // Map results to FrigateEvent and add source identifier
            return data.map(detail => mapEventDetailToFrigateEvent(detail, instanceFrigateUrl));

        } catch (err: any) {
            console.error(`Network or parsing error fetching from ${targetUrl}: ${err.message}`);
            return null;
        }
    });

    try {
        const results = await Promise.all(fetchPromises);
        const allEvents: FrigateEvent[] = results
            .filter((result): result is FrigateEvent[] => result !== null) // Filter out null results from failed fetches/skipped instances
            .flat(); // Flatten the array of arrays

        console.log(`Fetched a total of ${allEvents.length} events from all semantic endpoints.`);

        // --- Global Sorting ---
        // The FastAPI service already sorts according to the 'sort' parameter.
        // However, when merging results from multiple instances, we need a global sort.
        // We'll use the same sort logic here based on the requested 'sort' parameter.
        allEvents.sort((a, b) => {
            switch (sort) {
                case 'date_asc': return (a.start_time ?? 0) - (b.start_time ?? 0);
                case 'score_asc': // Least similar first (higher distance, lower confidence)
                    // Using search_distance directly for score sorting (lower distance = better score)
                    return (b.search_distance ?? Infinity) - (a.search_distance ?? Infinity); // Sort distance DESC for score ASC
                case 'score_desc': // Most similar first (lower distance, higher confidence)
                    // Using search_distance directly for score sorting (lower distance = better score)
                    return (a.search_distance ?? Infinity) - (b.search_distance ?? Infinity); // Sort distance ASC for score DESC
                case 'date_desc':
                default: // Default to newest first if sort is invalid or date_desc
                    return (b.start_time ?? 0) - (a.start_time ?? 0);
            }
        });

        console.log(`Sorted ${allEvents.length} events globally using sort option: ${sort}`);

        // --- Global Limit ---
        // Apply the limit *after* merging and sorting results from all instances.
        const limitedEvents = allEvents.slice(0, limit);

        console.log(`Returning ${limitedEvents.length} final events after global sort and limit.`);
        return json(limitedEvents);

    } catch (err: any) {
        console.error('Error during aggregated semantic search processing:', err);
        throw error(500, 'Failed to process aggregated semantic search results.');
    }
};