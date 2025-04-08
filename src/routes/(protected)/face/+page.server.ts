import type { CameraType } from "../types";
import getAllClusters from "./fetchers";

export const load = async ({ fetch }) => {
    const [clusters, response] = await Promise.all([
        getAllClusters(),          // Promise 1: Get clusters
        fetch('/api/all-cameras') // Promise 2: Fetch cameras (returns Response object)
    ]);
    const responseJson = await response.json() as { data: CameraType[] };
    return {
        clusters,
        cameras: responseJson.data
    }
};