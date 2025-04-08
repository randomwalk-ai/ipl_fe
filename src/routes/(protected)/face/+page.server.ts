import getAllClusters from "./fetchers";

export const load = async () => {
    const clusters = await getAllClusters();
    return {
        clusters
    }
};