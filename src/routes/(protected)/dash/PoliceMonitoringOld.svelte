<script lang="ts">
    import { fly } from 'svelte/transition';
    import { timeAgo } from '$lib/utils';
    import type { PoliceMonitoringType } from '../types';
    import { ArrowLeftIcon } from '@lucide/svelte';

    // Props using runes syntax
    const {
        policeMonitoringData,
        showingPoliceView,
        showPoliceView,
        backToGroupedView,
        MEDIA_BASE_URL,
        isSelected
    } = $props<{
        policeMonitoringData: PoliceMonitoringType[];
        showingPoliceView: boolean;
        showPoliceView: () => void;
        backToGroupedView: () => void;
        MEDIA_BASE_URL: string;
        isSelected: boolean;
    }>();

    // Format duration in seconds to minutes and seconds
    function formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}m ${remainingSeconds}s`;
    }

    // Sort police monitoring data outside of the template to avoid state mutation
    const sortedPoliceMonitoringData = () => {
        return [...policeMonitoringData].sort((a, b) => new Date(b.fromTimestamp).getTime() - new Date(a.fromTimestamp).getTime());
    };
</script>

<!-- Police Monitoring Card for main view -->
{#if !showingPoliceView}
    <div
        class="flex flex-col cursor-pointer items-center justify-center rounded-md border p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 {isSelected ? 'ring-2 ring-primary' : ''}"
        role="button"
        tabindex="0"
        on:click={showPoliceView}
        on:keydown={(e) => e.key === 'Enter' && showPoliceView()}
        in:fly={{ y: 10, duration: 200, delay: 50 }}
    >
        <h4 class="mb-2 text-lg font-semibold">No Police</h4>
        <p class="text-xs text-center text-muted-foreground mb-3">Alert when no police personnel are detected in required areas.</p>
        <div class="flex flex-col items-center rounded-md bg-gray-100 p-2 dark:bg-gray-800 w-full">
            <span class="font-medium">{policeMonitoringData.length}</span>
            <span class="text-xs text-muted-foreground">Total</span>
        </div>
    </div>
{:else}
    <!-- Police Monitoring Alerts View -->
    <div class="p-4">
        {#if policeMonitoringData.length === 0}
            <p class="text-center text-gray-500 dark:text-gray-400">No police monitoring alerts found</p>
        {:else}
            <div class="grid gap-4">
                {#each sortedPoliceMonitoringData() as alert}
                    <div
                        class="grid cursor-pointer gap-1 rounded-md border p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700"
                        role="button"
                        tabindex="0"
                        in:fly={{ y: 10, duration: 200, delay: 50 }}
                    >
                        <div class="flex items-center gap-3">
                            <!-- Video clip preview if available -->
                            <div class="w-24 h-16 bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                                {#if alert.clipPath}
                                    {console.log(MEDIA_BASE_URL + alert.clipPath)}
                                    <video 
                                        src={`${MEDIA_BASE_URL}/${alert.clipPath}`}
                                        class="w-full h-full object-cover"
                                        on:error={(e) => {
                                            const target = e.currentTarget as HTMLVideoElement;
                                            target.src = '';
                                            target.classList.add('bg-gray-300');
                                        }}
                                    />
                                {:else}
                                    <div class="w-full h-full flex items-center justify-center">
                                        <span class="text-xs text-gray-500">No preview</span>
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="flex grow flex-col gap-1">
                                <div class="text-md flex w-full items-center justify-between font-medium leading-none">
                                    <span class="truncate pr-2">Camera ID: {alert.cameraId}</span>
                                    <span class="flex-shrink-0 text-sm text-muted-foreground">
                                        {timeAgo(alert.fromTimestamp)}
                                    </span>
                                </div>
                                <span class="text-xs leading-tight text-muted-foreground">
                                    Missing Duration: {formatDuration(alert.missingDuration)}
                                </span>
                                <span class="text-xs leading-tight text-muted-foreground">
                                    From: {new Date(alert.fromTimestamp).toLocaleString()} 
                                </span>
                                <span class="text-xs leading-tight text-muted-foreground">
                                    To: {new Date(alert.toTimestamp).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
{/if} 