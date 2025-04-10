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
        MEDIA_BASE_URL
    } = $props<{
        policeMonitoringData: PoliceMonitoringType[];
        showingPoliceView: boolean;
        showPoliceView: () => void;
        backToGroupedView: () => void;
        MEDIA_BASE_URL: string;
    }>();

    // Format duration in seconds to minutes and seconds
    function formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}m ${remainingSeconds}s`;
    }
    
    // Modal state
    let showModal = false;
    let currentClipPath = '';
    
    // Function to open modal with clip
    function openClipModal(clipPath: string) {
        console.log('Opening Modal');
        currentClipPath = clipPath;
        showModal = true;
    }
    
    // Function to close modal
    function closeModal() {
        showModal = false;
        currentClipPath = '';
    }

</script>

<!-- Police Monitoring Card for main view -->
{#if !showingPoliceView}
    <div
        class="flex flex-col cursor-pointer items-center justify-center rounded-md border p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700"
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
                {#each policeMonitoringData as alert}
                    <div
                        class="grid cursor-pointer gap-1 rounded-md border p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700"
                        role="button"
                        tabindex="0"
                        in:fly={{ y: 10, duration: 200, delay: 50 }}
                    >
                        <div class="flex items-center gap-3">
                            <!-- Video clip preview if available -->
                            <div 
                                class="w-24 h-16 bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
                                on:click={() => alert.clipPath && openClipModal(alert.clipPath)}
                                on:keydown={(e) => e.key === 'Enter' && alert.clipPath && openClipModal(alert.clipPath)}
                                role="button"
                                tabindex="0"
                            >
                                {#if alert.snapshotPath}
                                    {console.log(alert.clipPath)}
                                    <img
                                        src={`${MEDIA_BASE_URL}/snapshot/${alert.snapshotPath}`}
                                        alt="Alert thumbnail" 
                                        class="w-full h-full object-cover"
                                        on:error={(e) => {
                                            e.currentTarget.src = '';
                                            e.currentTarget.classList.add('bg-gray-300');
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
                                    <span class="truncate pr-2">Camera ID: {alert.camera_id}</span>
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

<!-- Modal for displaying video clip -->
{#if showModal}
    <div 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        on:click={closeModal}
        on:keydown={(e) => e.key === 'Escape' && closeModal()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div 
            class="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full mx-4 relative"
            on:click|stopPropagation={() => {}}
        >
            <button 
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                on:click={closeModal}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <h3 class="text-lg font-semibold mb-4">Alert Video</h3>
            
            <div class="aspect-video bg-black rounded-md overflow-hidden">
                {#if currentClipPath}
                    <video 
                        src={`${MEDIA_BASE_URL}/clip/${currentClipPath}`} 
                        controls 
                        autoplay 
                        class="w-full h-full"
                    >
                        Your browser does not support the video tag.
                    </video>
                {:else}
                    <div class="w-full h-full flex items-center justify-center text-white">
                        No video available
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if} 