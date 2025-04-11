import { PUBLIC_SERVICE_ENDPOINT } from "$env/static/public";

export interface Cluster {
    cluster_id: string
    member_count: number
    quality_sum: number
    max_recorded_quality: number
    created_at: string
    last_updated_at: string
    representative_thumbnail_url: string
}

export default async function getAllClusters() {
    const response = await fetch(PUBLIC_SERVICE_ENDPOINT + '/clusters');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return (response.json() as Promise<Cluster[]>).then((e) => {
        // remap representative_thumbnail_url
        return e.map((cluster) => {
            return {
                ...cluster,
                representative_thumbnail_url: `${PUBLIC_SERVICE_ENDPOINT}/cluster_images/${cluster.cluster_id}.jpg`
            }
        })
    });
    // remap representative_thumbnail_url
}
export interface Face {
    embedding_id: string
    cluster_id: string
    timestamp: string
    camera_id: string
    detection_box: number[]
    image_quality: number
    source_event_id: string
    source_snapshot_filename: string
    inserted_at: string
    thumbnail_url: string
}

export async function getClusterFaces(cluster_id: string) {
    const response = await fetch(PUBLIC_SERVICE_ENDPOINT + '/clusters/' + cluster_id + '/faces');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return (response.json() as Promise<Face[]>).then((e) => {
        // remap representative_thumbnail_url
        return e.map((face) => {
            return {
                ...face,
                thumbnail_url: `${PUBLIC_SERVICE_ENDPOINT}/face_thumbnails/${face.source_snapshot_filename}`
            }
        })
    }
    );
}

export interface FaceSearchResult {
    embedding_id: string; // UUID
    cluster_id: string | null; // UUID, can be null
    timestamp: string; // ISO 8601 datetime string
    camera_id: string | null;
    // Assuming detection_box structure; adjust if different or use Record<string, any> | null for more flexibility
    detection_box: { x: number; y: number; w: number; h: number } | [number, number, number, number] | null;
    image_quality: number | null;
    source_event_id: string | null;
    source_snapshot_filename: string | null;
    inserted_at: string; // ISO 8601 datetime string
    thumbnail_url: string | null; // URL can be null if generation failed or no source
    distance: number; // Similarity/distance metric
}

/**
 * Represents a single cluster search result.
 * Corresponds to Python's ClusterSearchResult Pydantic model.
 */
export interface ClusterSearchResult {
    cluster_id: string; // UUID
    member_count: number;
    quality_sum: number;
    max_recorded_quality: number;
    created_at: string; // ISO 8601 datetime string
    last_updated_at: string; // ISO 8601 datetime string
    representative_thumbnail_url: string | null; // URL can be null if generation failed
    distance: number; // Similarity/distance metric
}

/**
 * Represents the overall response structure for the search endpoint.
 * Matches can contain results of different types depending on the 'priority' requested.
 */
export interface SearchResponse {
    query_face_found: boolean;
    matches: (FaceSearchResult | ClusterSearchResult)[]; // Array containing either type
}

export type SearchPriority = 'faces' | 'clusters';

/**
 * Optional filter parameters for the search request.
 */
export interface SearchOptions {
    startTime?: Date | string; // Can accept Date object or ISO string
    endTime?: Date | string;   // Can accept Date object or ISO string
    cameraIds?: string[];
    minImageQuality?: number;  // Should be between 0.0 and 1.0
    minClusterQuality?: number; // Should be between 0.0 and 1.0
    minClusterSize?: number;   // Should be >= 1
    maxDistance?: number; // Optional max distance for filtering results between 0.0 and 1.0
}

/**
 * Performs a face or cluster search by uploading an image file.
 *
 * @param file The image file containing the face to search for.
 * @param priority Whether to prioritize 'faces' or 'clusters' in the search.
 * @param limit The maximum number of results to return.
 * @param options Optional filters to apply to the search.
 * @returns A promise resolving to the SearchResponse.
 */
export async function searchByImage(
    file: File,
    priority: SearchPriority,
    limit: number,
    options: SearchOptions = {} // Default to empty object if no options provided
): Promise<SearchResponse> {
    // Construct the URL with base query parameters
    const url = new URL(`${PUBLIC_SERVICE_ENDPOINT}/search`);
    url.searchParams.append('priority', priority);
    url.searchParams.append('limit', String(limit)); // Query params must be strings

    // Append optional filter parameters if they exist
    if (options.startTime) {
        const startTimeStr = options.startTime instanceof Date ? options.startTime.toISOString() : options.startTime;
        url.searchParams.append('start_time', startTimeStr);
    }
    if (options.endTime) {
        const endTimeStr = options.endTime instanceof Date ? options.endTime.toISOString() : options.endTime;
        url.searchParams.append('end_time', endTimeStr);
    }
    if (options.cameraIds && options.cameraIds.length > 0) {
        // FastAPI expects multiple parameters with the same name for a list
        options.cameraIds.forEach(id => url.searchParams.append('camera_ids', id));
    }
    if (options.minImageQuality !== undefined && options.minImageQuality !== null) {
        url.searchParams.append('min_image_quality', String(options.minImageQuality));
    }
    if (options.minClusterQuality !== undefined && options.minClusterQuality !== null) {
        url.searchParams.append('min_cluster_quality', String(options.minClusterQuality));
    }
    if (options.minClusterSize !== undefined && options.minClusterSize !== null) {
        url.searchParams.append('min_cluster_size', String(options.minClusterSize));
    }
    if (options.maxDistance !== undefined && options.maxDistance !== null) {
        url.searchParams.append('max_distance', String(options.maxDistance));
    }

    // Prepare the form data payload
    const formData = new FormData();
    formData.append('file', file, file.name);

    console.log(`Sending search request to: ${url.toString()}`); // Log the final URL with params

    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            // 'Content-Type': 'multipart/form-data' is usually set automatically by fetch with FormData
            'Accept': 'application/json', // Tell the server we expect JSON back
            // Add any necessary auth headers here
            // 'Authorization': 'Bearer YOUR_TOKEN',
        },
        body: formData,
    });

    if (!response.ok) {
        let errorBody: any = await response.text(); // Try text first
        try {
            errorBody = JSON.parse(errorBody); // Try parsing as JSON if possible (FastAPI often returns JSON errors)
        } catch (e) {
            // Keep as text if not JSON
        }
        console.error("Search request failed:", response.status, response.statusText, errorBody);
        // Construct a more informative error message
        const detail = (errorBody && typeof errorBody === 'object' && errorBody.detail) ? errorBody.detail : errorBody;
        throw new Error(`Search failed: ${response.status} ${response.statusText}. ${detail}`);
    }

    // Type assertion is okay here if we trust the backend adheres to the contract
    return (response.json() as Promise<SearchResponse>).then((data) => {
        // Remap thumbnail URLs for faces
        data.matches = data.matches.map((match) => {
            if ('thumbnail_url' in match && match.thumbnail_url) {
                return {
                    ...match,
                    thumbnail_url: `${PUBLIC_SERVICE_ENDPOINT}/face_thumbnails/${match.source_snapshot_filename}`
                };
            }
            if ('representative_thumbnail_url' in match && match.representative_thumbnail_url) {
                return {
                    ...match,
                    representative_thumbnail_url: `${PUBLIC_SERVICE_ENDPOINT}/cluster_images/${match.cluster_id}.jpg`
                };
            }
            return match;
        });
        return data;
    }
    );
}

