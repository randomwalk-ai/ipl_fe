<script lang="ts">
  import { onMount } from 'svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Switch from '$lib/components/ui/switch';
  import * as Slider from '$lib/components/ui/slider';
  import { 
    FlagIcon, 
    PawPrintIcon, 
    FootprintsIcon, 
    BanIcon, 
    UsersIcon, 
    FlameIcon, 
    AlertTriangleIcon, 
    PackageIcon, 
    SwordIcon,
    ImageIcon,
    VideoIcon
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
    thumbnail?: string;
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
  export let alertsData: AlertData[] = [];
  let alertsWithCounts: AlertItem[] = [];
  let selectedAlertId: string | null = null;
  let selectedAlertDetails: AlertDetail[] = [];
  let isLoading = false;
  let showCards = true;
  
  // Filter state
  let showNewOnly = true;
  let maxResults = 10;
  let filteredAlertDetails: AlertDetail[] = [];
  
  // Modal state
  let modalOpen = false;
  let currentDetail: AlertDetail | null = null;
  let activeTab: 'clip' | 'snapshot' = 'clip';

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

  // Watch for changes in alertsData
  $: if (alertsData && alertsData.length) {
    // Merge the counts with the alert items
    alertsWithCounts = alertItems.map(item => {
      const data = alertsData.find((data: AlertData) => data.id === item.id);
      return {
        ...item,
        count: data ? data.count : 0
      };
    });
  }
  
  // Apply filters when selectedAlertDetails or filter settings change
  $: if (selectedAlertId && selectedAlertDetails.length) {
    applyFilters();
  }
  
  function applyFilters() {
    // Start with all details
    let filtered = [...selectedAlertDetails];
    
    // Apply new-only filter if enabled
    if (showNewOnly) {
      filtered = filtered.filter(detail => detail.is_notified === false);
    }
    
    // Apply max results limit
    filtered = filtered.slice(0, maxResults);
    
    filteredAlertDetails = filtered;
  }

  onMount(async () => {
    if (!alertsData || alertsData.length === 0) {
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
    }
  });

  function handleCardClick(alertId: string) {
    if (selectedAlertId === alertId) {
      // If clicking the same card, toggle it off
      selectedAlertId = null;
      selectedAlertDetails = [];
      filteredAlertDetails = [];
      showCards = true;
      return;
    }

    selectedAlertId = alertId;
    const alertData = alertsData.find(data => data.id === alertId);
    selectedAlertDetails = alertData ? alertData.details : [];
    applyFilters(); // Apply filters to the selected details
    showCards = false;
  }

  function openMediaModal(detail: AlertDetail) {
    currentDetail = detail;
    // Set default active tab based on what's available
    if (detail.clip_path) {
      activeTab = 'clip';
    } else if (detail.thumb_path) {
      activeTab = 'snapshot';
    }
    modalOpen = true;
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
            onclick={() => { selectedAlertId = null; selectedAlertDetails = []; showCards = true; }}
          >
            Back
          </button>
        </div>
        
        <!-- Filter controls -->
        <div class="p-3 bg-muted/30 rounded-md mb-3 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium">Show New Only:</span>
            <Switch.Root 
              checked={showNewOnly} 
              onCheckedChange={(checked) => { 
                showNewOnly = checked; 
                applyFilters();
              }}
            />
          </div>
          
          <div class="flex flex-col w-full sm:w-1/3 gap-1">
            <div class="flex justify-between">
              <span class="text-xs font-medium">Max Results: {maxResults}</span>
            </div>
            <Slider.Root 
              value={[maxResults]} 
              onValueChange={(values) => { 
                maxResults = values[0]; 
                applyFilters();
              }}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
          </div>
        </div>
        
        {#if filteredAlertDetails.length === 0}
          <div class="text-center p-6 bg-muted rounded-lg">
            <p>No details available for this alert.</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each filteredAlertDetails as detail}
              <Card.Root class="w-full overflow-hidden">
                <div class="flex flex-col md:flex-row">
                  {#if detail.thumb_path || detail.thumbnail}
                    <div 
                      class="w-full md:w-1/4 h-36 cursor-pointer" 
                      onclick={() => openMediaModal(detail)} 
                      onkeydown={(e) => e.key === 'Enter' && openMediaModal(detail)}
                      role="button"
                      tabindex={0}
                    >
                      <img 
                        src={detail.thumbnail || detail.thumb_path} 
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
                      {#if detail.clip_path || detail.thumb_path}
                        <div class="mt-1.5">
                          <button 
                            class="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-md text-xs"
                            onclick={() => openMediaModal(detail)}
                          >
                            View Media
                          </button>
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

<!-- Media Viewer Modal -->
<Dialog.Root bind:open={modalOpen}>
  <Dialog.Content class="sm:max-w-[90vw] max-h-[90vh] overflow-hidden">
    <Dialog.Header>
      <Dialog.Title>{currentDetail?.query || 'Media Viewer'}</Dialog.Title>
      <Dialog.Description class="text-xs">
        {currentDetail?.camera_id ? `Camera: ${currentDetail.camera_id}` : ''}
        {currentDetail?.start_timestamp ? ` | Time: ${formatTimestamp(currentDetail.start_timestamp)}` : ''}
      </Dialog.Description>
    </Dialog.Header>
    
    {#if currentDetail}
      <div class="flex justify-center gap-2 mb-2">
        {#if currentDetail.clip_path}
          <button 
            class="px-3 py-1 rounded-md text-sm flex items-center gap-1.5 {activeTab === 'clip' ? 'bg-primary text-primary-foreground' : 'bg-muted'}"
            onclick={() => activeTab = 'clip'}
          >
            <VideoIcon class="h-4 w-4" /> Clip
          </button>
        {/if}
        {#if currentDetail.thumb_path || currentDetail.thumbnail}
          <button 
            class="px-3 py-1 rounded-md text-sm flex items-center gap-1.5 {activeTab === 'snapshot' ? 'bg-primary text-primary-foreground' : 'bg-muted'}"
            onclick={() => activeTab = 'snapshot'}
          >
            <ImageIcon class="h-4 w-4" /> Snapshot
          </button>
        {/if}
      </div>
      
      <div class="overflow-auto max-h-[60vh]">
        {#if activeTab === 'clip' && currentDetail.clip_path}
          <video 
            controls 
            class="w-full max-h-[60vh]" 
            autoplay
            preload="auto"
            controlsList="nodownload"
            crossorigin="anonymous"
          >
            <source src={currentDetail.clip_path} type="video/mp4">
            <source src={currentDetail.clip_path} type="video/webm">
            <source src={currentDetail.clip_path} type="application/x-mpegURL">
            <track kind="captions" src="" label="English" />
            Your browser does not support the video tag.
          </video>
          <div class="mt-2 text-center">
            <a 
              href={currentDetail.clip_path} 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-xs text-primary underline"
            >
              Open video in new tab
            </a>
          </div>
        {:else if activeTab === 'snapshot' && (currentDetail.thumb_path || currentDetail.thumbnail)}
          <img 
            src={currentDetail.thumbnail || currentDetail.thumb_path} 
            alt={currentDetail.query} 
            class="w-full max-h-[60vh] object-contain"
            
          />
        {:else}
          <div class="text-center p-8">
            <p>No media available</p>
          </div>
        {/if}
      </div>
    {/if}
    
    <Dialog.Footer>
      <Dialog.Close class="bg-muted px-3 py-1 rounded-md text-sm">Close</Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root> 