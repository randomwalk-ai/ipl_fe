<script lang="ts">
  import { onMount } from 'svelte';
  import * as Card from '$lib/components/ui/card';
  import { 
    FlagIcon, 
    PawPrintIcon, 
    FootprintsIcon, 
    BanIcon, 
    UsersIcon, 
    FlameIcon, 
    AlertTriangleIcon, 
    PackageIcon, 
    SwordIcon 
  } from '@lucide/svelte';
  import { format } from 'date-fns';

  type AlertDetail = {
    id: string;
    query: string;
    camera_id: string;
    thumb_path: string;
    start_timestamp: string;
    end_timestamp: string;
    duration?: number;
    clip_path?: string;
  };

  type AlertData = {
    id: string;
    count: number;
    details: AlertDetail[];
  };

  type AlertItem = {
    id: string;
    mainTitle: string;
    alertTitle: string | string[];
    description: string;
    icon: string;
    count?: number;
  };

  export let alertItems: AlertItem[] = [];
  let alertsWithCounts: AlertItem[] = [];
  let alertsData: AlertData[] = [];
  let selectedAlertId: string | null = null;
  let selectedAlertDetails: AlertDetail[] = [];
  let isLoading = false;
  let showCards = true;

  const iconMap = {
    FlagIcon,
    PawPrintIcon,
    FootprintsIcon,
    BanIcon,
    UsersIcon,
    FlameIcon,
    AlertTriangleIcon,
    PackageIcon,
    SwordIcon
  };

  onMount(async () => {
    isLoading = true;
    try {
      const response = await fetch('/api/alerts-data');
      if (!response.ok) {
        throw new Error('Failed to fetch alert data');
      }
      
      alertsData = await response.json();
      
      // Merge the counts with the alert items
      alertsWithCounts = alertItems.map(item => {
        const data = alertsData.find((data: AlertData) => data.id === item.id);
        return {
          ...item,
          count: data ? data.count : 0
        };
      });
    } catch (error) {
      console.error('Error fetching alert data:', error);
      // If there's an error, just use the original items with count 0
      alertsWithCounts = alertItems.map(item => ({ ...item, count: 0 }));
    } finally {
      isLoading = false;
    }
  });

  function handleCardClick(alertId: string) {
    if (selectedAlertId === alertId) {
      // If clicking the same card, toggle it off
      selectedAlertId = null;
      selectedAlertDetails = [];
      showCards = true;
      return;
    }

    selectedAlertId = alertId;
    const alertData = alertsData.find(data => data.id === alertId);
    selectedAlertDetails = alertData ? alertData.details : [];
    showCards = false;
  }

  function formatTimestamp(timestamp: string): string {
    if (!timestamp) return 'N/A';
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return timestamp;
    }
  }

  function formatDuration(seconds: number): string {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    result += `${remainingSeconds}s`;
    
    return result;
  }
</script>

<div class="flex flex-col gap-3 p-2">
  {#if isLoading}
    <div class="flex justify-center items-center p-6">
      <div class="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full"></div>
    </div>
  {:else}
    {#if showCards}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {#each alertsWithCounts.length ? alertsWithCounts : alertItems as alert}
          <Card.Root 
            class="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md {selectedAlertId === alert.id ? 'ring-2 ring-primary' : ''}" 
            onclick={() => handleCardClick(alert.id)}
            onkeydown={(e) => e.key === 'Enter' && handleCardClick(alert.id)}
            tabindex={0}
            role="button"
            aria-pressed={selectedAlertId === alert.id}
          >
            <Card.Header class="p-0 flex flex-row items-center justify-between">
              <div class="bg-[#1E293B] text-lg text-white font-bold h-9 w-full flex items-center justify-center">
                {alert.count ?? 0}
              </div>
            </Card.Header>

            <Card.Footer class="p-3 flex justify-between items-center">
              <Card.Title class="text-xs">{alert.mainTitle}</Card.Title>
              <div class="bg-primary/10 p-1.5 rounded-full">
                {#if alert.icon && iconMap[alert.icon as keyof typeof iconMap]}
                  <svelte:component this={iconMap[alert.icon as keyof typeof iconMap]} class="h-4 w-4 text-primary" />
                {:else}
                  <AlertTriangleIcon class="h-4 w-4 text-primary" />
                {/if}
              </div>
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    {/if}

    {#if selectedAlertId}
      <div class="w-full">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold">
            {alertItems.find(item => item.id === selectedAlertId)?.mainTitle}
          </h2>
          <button 
            class="px-2.5 py-0.5 bg-muted rounded-md text-xs font-medium hover:bg-muted/80"
            on:click={() => { selectedAlertId = null; selectedAlertDetails = []; showCards = true; }}
          >
            Back
          </button>
        </div>
        
        {#if selectedAlertDetails.length === 0}
          <div class="text-center p-6 bg-muted rounded-lg">
            <p>No details available for this alert.</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each selectedAlertDetails as detail}
              <Card.Root class="w-full overflow-hidden">
                <div class="flex flex-col md:flex-row">
                  {#if detail.thumb_path}
                    <div class="w-full md:w-1/4 h-36">
                      <img 
                        src={detail.thumb_path} 
                        alt={detail.query} 
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  {/if}
                  <div class="p-3 flex-1">
                    <div class="flex flex-col gap-1.5">
                      <h3 class="text-base font-bold">{detail.query}</h3>
                      <p class="text-xs text-muted-foreground">Camera ID: {detail.camera_id || 'N/A'}</p>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-1.5">
                        <div>
                          <p class="text-xs font-medium">Start Time:</p>
                          <p class="text-xs">{formatTimestamp(detail.start_timestamp)}</p>
                        </div>
                        <div>
                          <p class="text-xs font-medium">End Time:</p>
                          <p class="text-xs">{formatTimestamp(detail.end_timestamp)}</p>
                        </div>
                        {#if detail.duration !== undefined}
                          <div>
                            <p class="text-xs font-medium">Duration:</p>
                            <p class="text-xs">{formatDuration(detail.duration)}</p>
                          </div>
                        {/if}
                      </div>
                      {#if detail.clip_path}
                        <div class="mt-1.5">
                          <a 
                            href={detail.clip_path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-md text-xs"
                          >
                            View Clip
                          </a>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </Card.Root>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div> 