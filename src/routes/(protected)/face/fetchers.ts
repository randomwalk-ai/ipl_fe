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
    return response.json() as Promise<Cluster[]>;
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
    return response.json() as Promise<Face[]>;
}