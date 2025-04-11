<script lang="ts">
    import { ArrowLeftIcon } from '@lucide/svelte';
    import { fly } from 'svelte/transition';
    import { timeAgo } from '$lib/utils';
    import type { CombinedAlertItem } from './types';

    // Props using runes syntax
    const {
        bannerAndSlogansConfig,
        organized_grouped_alerts,
        bannerAlertsData,
        bannerQueries,
        MEDIA_BASE_URL,
        filteredBannerAlerts,
        showingBannerQueriesView,
        showingBannerAlertsView,
        selectedCamera,
        selectedBannerQuery,
        showBannerQueriesView,
        showBannerAlertsView,
        showBannerQueryAlerts,
        backToGroupedView,
        openModal
    } = $props<{
        bannerAndSlogansConfig: {
            mainTitle: string;
            alertTitle: string[];
            description: string;
        };
        organized_grouped_alerts: Array<{
            query: string;
            cameras: Array<{
                cameraName: string;
                alerts: Array<{
                    redirectURL: string;
                    thumbnail: string;
                    id: string;
                    end_time: string;
                }>;
            }>;
        }>;
        bannerAlertsData: {
            allAlerts: CombinedAlertItem[];
            byCameras: Array<{
                camera: string;
                alerts: CombinedAlertItem[];
                latestAlert: CombinedAlertItem;
                count: number;
            }>;
        };
        bannerQueries: Array<{
            query: string;
            cameras: Array<{
                cameraName: string;
                alerts: Array<{
                    redirectURL: string;
                    thumbnail: string;
                    id: string;
                    end_time: string;
                }>;
            }>;
        }>;
        MEDIA_BASE_URL: string;
        filteredBannerAlerts: CombinedAlertItem[];
        showingBannerQueriesView: boolean;
        showingBannerAlertsView: boolean;
        selectedCamera: string;
        selectedBannerQuery: string;
        showBannerQueriesView: () => void;
        showBannerAlertsView: (camera: string) => void;
        showBannerQueryAlerts: (query: string) => void;
        backToGroupedView: () => void;
        openModal: (item: CombinedAlertItem) => void;
    }>();

    // Organize cameras with their queries
    let camerasWithQueries = $derived.by(() => {
        // Create a map to organize by camera
        const cameraMap = new Map<string, {
            cameraName: string,
            queries: Set<string>,
            thumbnails: Map<string, string>,
            latestTime: string,
            totalAlerts: number
        }>();
        
        // Process each query group
        organized_grouped_alerts.forEach(queryGroup => {
            // Only process banner-related queries
            if (!bannerAndSlogansConfig.alertTitle.some(title => 
                queryGroup.query.toLowerCase().includes(title.toLowerCase())
            )) {
                return;
            }
            
            // Process each camera in this query
            queryGroup.cameras.forEach(camera => {
                if (!cameraMap.has(camera.cameraName)) {
                    cameraMap.set(camera.cameraName, {
                        cameraName: camera.cameraName,
                        queries: new Set(),
                        thumbnails: new Map(),
                        latestTime: '',
                        totalAlerts: 0
                    });
                }
                
                const cameraInfo = cameraMap.get(camera.cameraName)!;
                cameraInfo.queries.add(queryGroup.query);
                cameraInfo.totalAlerts += camera.alerts.length;
                
                // Store thumbnail for this query if available
                if (camera.alerts.length > 0 && camera.alerts[0].thumbnail) {
                    cameraInfo.thumbnails.set(queryGroup.query, camera.alerts[0].thumbnail);
                    
                    // Update latest time if this is more recent
                    const alertTime = new Date(camera.alerts[0].end_time).getTime();
                    if (!cameraInfo.latestTime || alertTime > new Date(cameraInfo.latestTime).getTime()) {
                        cameraInfo.latestTime = camera.alerts[0].end_time;
                    }
                }
            });
        });
        
        // Convert to array and sort by camera name
        return Array.from(cameraMap.values())
            .sort((a, b) => a.cameraName.localeCompare(b.cameraName));
    });
</script>

<!-- Banner & Slogans Card for main view -->
{#if !showingBannerQueriesView && !showingBannerAlertsView}
    <div
        class="flex flex-col cursor-pointer items-center justify-center rounded-md border p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
        role="button"
        tabindex="0"
        on:click={showBannerQueriesView}
        on:keydown={(e) => e.key === 'Enter' && showBannerQueriesView()}
        in:fly={{ y: 10, duration: 200, delay: 50 }}
    >
        <h4 class="mb-2 text-lg font-semibold">{bannerAndSlogansConfig.mainTitle}</h4>
        <p class="text-xs text-center text-muted-foreground mb-3">{bannerAndSlogansConfig.description}</p>
        <div class="flex flex-col items-center rounded-md bg-gray-100 p-2 dark:bg-gray-800 w-full">
            <span class="font-medium">{camerasWithQueries.reduce((acc, camera) => acc + camera.totalAlerts, 0)}</span>
            <span class="text-xs text-muted-foreground">Total</span>
        </div>
    </div>
{:else if showingBannerQueriesView && !showingBannerAlertsView}
    <!-- Cameras with Queries View -->
    <div class="p-4">
        
        {#if camerasWithQueries.length === 0}
            <p class="text-center text-gray-500 dark:text-gray-400">No banner and slogan alerts found</p>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {#each camerasWithQueries as camera}
                    <div
                        class="flex flex-col cursor-pointer rounded-md border p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
                        role="button"
                        tabindex="0"
                        on:click={() => showBannerAlertsView(camera.cameraName)}
                        on:keydown={(e) => e.key === 'Enter' && showBannerAlertsView(camera.cameraName)}
                    >
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="text-md font-semibold truncate" title={camera.cameraName}>
                                {camera.cameraName.length > 15 ? '...' + camera.cameraName.slice(-15) : camera.cameraName}
                            </h4>
                            {#if camera.latestTime}
                                <span class="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                    {timeAgo(camera.latestTime)}
                                </span>
                            {/if}
                        </div>
                        
                        <!-- Show thumbnail from first query if available -->
                        {#if camera.thumbnails.size > 0}
                            <div class="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden mb-2">
                                <img 
                                    src={`data:image/jpeg;base64,${Array.from(camera.thumbnails.values())[0]}`}
                                    alt="Latest alert" 
                                    class="w-full h-full object-cover"
                                    on:error={(e) => {
                                        e.currentTarget.src = '';
                                        e.currentTarget.classList.add('bg-gray-300');
                                    }}
                                />
                            </div>
                        {:else}
                            <div class="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center mb-2">
                                <span class="text-xs text-gray-500">No thumbnail</span>
                            </div>
                        {/if}
                        
                        <!-- Show query tags -->
                        <div class="mt-2 mb-2 flex flex-wrap gap-1">
                            {#each Array.from(camera.queries) as query}
                                <span class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                    {query}
                                </span>
                            {/each}
                        </div>
                        
                        <div class="mt-auto flex justify-between items-center">
                            <span class="text-sm">{camera.queries.size} queries</span>
                            <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {camera.totalAlerts} alerts
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
{:else if showingBannerAlertsView && selectedCamera}
    <!-- Banner alerts for specific camera view -->
    <div class="p-4">
        
        <!-- Get all alerts for this camera from organized_grouped_alerts -->
        {#if camerasWithQueries.find(c => c.cameraName === selectedCamera)?.totalAlerts === 0}
            <p class="text-center text-gray-500 dark:text-gray-400">No banner alerts found for this camera</p>
        {:else}
            <div class="grid gap-4">
                {#each organized_grouped_alerts
                    .filter(group => bannerAndSlogansConfig.alertTitle.some(title => 
                        group.query.toLowerCase().includes(title.toLowerCase())))
                    .flatMap(group => 
                        group.cameras
                            .filter(camera => camera.cameraName === selectedCamera)
                            .flatMap(camera => 
                                camera.alerts.map(alert => ({
                                    ...alert,
                                    query: group.query,
                                    cameraName: camera.cameraName
                                }))
                            )
                    )
                    .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime()) as alert}
                    <div
                        class="grid cursor-pointer gap-1 rounded-md border p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700"
                        role="button"
                        tabindex="0"
                        on:click={() => openModal({
                            id: alert.id,
                            query: alert.query,
                            time: alert.end_time,
                            description: `Alert from ${alert.cameraName}`,
                            type: 'alert',
                            redirect_url: alert.redirectURL,
                            cameraName: alert.cameraName
                        })}
                        on:keydown={(e) => e.key === 'Enter' && openModal({
                            id: alert.id,
                            query: alert.query,
                            time: alert.end_time,
                            description: `Alert from ${alert.cameraName}`,
                            type: 'alert',
                            redirect_url: alert.redirectURL,
                            cameraName: alert.cameraName
                        })}
                        in:fly={{ y: 10, duration: 200, delay: 50 }}
                    >
                        <div class="flex items-center gap-3">
                            <!-- Thumbnail if available -->
                            {#if alert.thumbnail}
                                <div class="w-24 h-16 bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                                    <img 
                                        src={`data:image/jpeg;base64,${alert.thumbnail}`}
                                        alt="Alert thumbnail" 
                                        class="w-full h-full object-cover"
                                        on:error={(e) => {
                                            e.currentTarget.src = '';
                                            e.currentTarget.classList.add('bg-gray-300');
                                        }}
                                    />
                                </div>
                            {:else}
                                <div class="w-24 h-16 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                                    <span class="text-xs text-gray-500">No thumbnail</span>
                                </div>
                            {/if}
                            
                            <div class="flex grow flex-col gap-1">
                                <div class="text-md flex w-full items-center justify-between font-medium leading-none">
                                    <span class="truncate pr-2">{alert.query}</span>
                                    <span class="flex-shrink-0 text-sm text-muted-foreground">
                                        {timeAgo(alert.end_time)}
                                    </span>
                                </div>
                                <span class="text-xs leading-tight text-muted-foreground">
                                    Alert ID: {alert.id.substring(0, 8)}...
                                </span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
{/if} 