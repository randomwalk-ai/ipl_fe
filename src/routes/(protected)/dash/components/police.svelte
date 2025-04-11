<script lang="ts">
	import { ClockIcon } from '@lucide/svelte';
	import type { PoliceMonitoringType } from '../types';
	export let title: string;
    export let data: PoliceMonitoringType[];
    export let mediaBaseUrl: string;
    
    let selectedVideo: string | null = null;
    let selectedVideoTitle: string | null = null;

    function openModal(videoPath: string, videoTitle: string) {
        selectedVideo = videoPath;
        selectedVideoTitle = videoTitle;
    }

    function closeModal() {
        selectedVideo = null;
        selectedVideoTitle = null;
    }

    function formatDateRange(from: string, to: string): string {
        const toDate = new Date(); // Present time
        const fromDate = new Date(from); // Keep from as is
        const timeDiff = Math.abs(toDate.getTime() - fromDate.getTime());
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        const hoursDiff = Math.floor(minutesDiff / 60);
        const daysDiff = Math.floor(hoursDiff / 24);

        let formattedRange = '';

        if (daysDiff > 0) {
            formattedRange = `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`;
        } else if (hoursDiff > 0) {
            formattedRange = `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
        } else if (minutesDiff > 0) {
            formattedRange = `${minutesDiff} min${minutesDiff > 1 ? 's' : ''} ago`;
        } else {
            formattedRange = 'Just now';
        }

        return `${formattedRange}`;
    }
</script>
<div class="p-4 rounded-md shadow-md overflow-auto">
    <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {#each data as item}
            <button class="p-3 border rounded-md shadow hover:shadow-lg transition-shadow" on:click={() => openModal(item.clipPath, item.clipPath)}>
                <h2 class="text-sm font-semibold">{item.cameraId.split('_').join(' ')}</h2>
                <div class="flex items-center justify-between text-xs">
                    <p class="mr-2">
                        <ClockIcon class="inline h-4 w-4" /> <!-- Show clock icon instead of duration -->
                        {formatDateRange(item.fromTimestamp, item.toTimestamp)}
                    </p>
                    <p class="text-gray-700 dark:text-gray-300">{item.missingDuration.toFixed(2)}s</p>
                </div>
                {#if item.clipPath}
                {:else}
                    <p class="text-gray-500 dark:text-gray-400">No video available</p>
                {/if}
                {#if item.snapshotPath}
                    <img 
                        src={`${mediaBaseUrl}/${item.snapshotPath}`}
                        alt="Snapshot" 
                        class="w-full h-auto mt-2 rounded cursor-pointer" 
                        on:click={() => openModal(item.clipPath, item.clipPath)}
                        on:error={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = '';
                            target.classList.add('bg-gray-300');
                        }}
                    />
                {:else}
                    <p class="text-gray-500 dark:text-gray-400">No snapshot available</p>
                {/if}
            </button>
        {/each}
    </div>
</div>

{#if selectedVideo}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-2 " on:click={closeModal}>
        <div class="relative dark:bg-gray-800 rounded-lg p-4">
            <button class="absolute top-2 right-2 text-gray-500" on:click={closeModal}>X</button>
            <h2 class="text-lg font-semibold mb-2">{selectedVideoTitle}</h2>
            <video 
                src={`${mediaBaseUrl}/${selectedVideo}`} 
                class="w-full h-auto" 
                controls 
                on:error={(e) => {
                    const target = e.currentTarget as HTMLVideoElement;
                    target.src = '';
                    target.classList.add('bg-gray-300');
                }}
            />
        </div>
    </div>
{/if}
