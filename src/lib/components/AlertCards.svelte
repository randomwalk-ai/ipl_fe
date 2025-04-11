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
    VideoIcon,
    ChevronDown,
    X,
    Loader2
  } from '@lucide/svelte';
  import { format } from 'date-fns';
  import * as Select from '$lib/components/ui/select';
  import * as Checkbox from '$lib/components/ui/checkbox';

  type AlertDetail = {
    id: string;
    query: string;
    camera_id: string;
    thumb_path: string;
    start_timestamp: string;
    end_timestamp: string;
    is_notified: boolean;
    duration?: number;
    clip_path?: string;
    thumbnail?: string;
  };

  type AlertData = {
    id: string;
    count: number;
    details: AlertDetail[];
    dbIds: any[];
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
  export let showNewOnly: boolean = true;
  export let maxResults: number = 1000;
  export let isFullscreen: boolean = false;
  
  let alertsData: AlertData[] = [];
  let filteredAlertsData: AlertData[] = [];
  let alertsWithCounts: AlertItem[] = [];
  let selectedAlertId: string | null = null;
  let selectedAlertDetails: AlertDetail[] = [];
  let filteredAlertDetails: AlertDetail[] = [];
  let isLoading = false;
  let showCards = true;
  
  // Modal state
  let modalOpen = false;
  let currentDetail: AlertDetail | null = null;
  let activeTab: 'clip' | 'snapshot' = 'clip';

  // Change these to arrays to support multiple selections
  let uniqueQueries: string[] = [];
  let selectedQueries: string[] = [];
  
  let uniqueCameras: string[] = [];
  let selectedCameras: string[] = [];

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

  // Replace the reactive timer with a more controlled approach
  let refreshInterval: number;

  // Watch for changes in showNewOnly to refetch data
  $: if (showNewOnly !== undefined) {
    fetchAlertData();
  }

  // Replace the entire refreshData function with this simpler version
  export function refreshData() {
    console.log("refreshData called, showCards:", showCards);
    
    if (showCards) {
      // If we're in card view, refresh immediately
      console.log("Refreshing data immediately");
      fetchAlertData();
    } else {
      // If in detail view, set a flag to refresh later
      console.log("Setting flag to refresh on return to cards");
      needsRefreshOnReturn = true;
    }
  }

  // Make sure this is defined at the script level
  let needsRefreshOnReturn = false;

  // Add this function to handle back button click
  function handleBackClick() {
    console.log("Back button clicked, needsRefreshOnReturn:", needsRefreshOnReturn);
    
    // Reset all state
    selectedAlertId = null;
    selectedAlertDetails = [];
    selectedQueries = [];
    selectedCameras = [];
    showCards = true;
    
    // Check if we need to refresh
    if (needsRefreshOnReturn) {
      console.log("Refreshing data after returning to cards");
      setTimeout(() => fetchAlertData(), 0); // Use setTimeout to ensure state is updated first
      needsRefreshOnReturn = false;
    }
  }

  async function fetchAlertData() {
    isLoading = true;
    try {
      // const queryParams = new URLSearchParams();
      // queryParams.set('newOnly', showNewOnly.toString());
      // queryParams.set('limit', maxResults.toString());
      
      const response = await fetch(`/api/alerts-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch alert data');
      }
      
      alertsData = await response.json();
      // Store all alert ids in local storage in the format of { alertId : [ids,...] } only if the alert is not notified

      const cachedAlertItems: { [key: string]: string[] } = {};
      alertsData.forEach((item) => {
        cachedAlertItems[item.id] = item.dbIds
      });
      localStorage.setItem('unNotifiedAlertIds', JSON.stringify(cachedAlertItems));
      applyFilters();
    } catch (error) {
      console.error('Error fetching alert data:', error);
      // If there's an error, just use the original items with count 0
      alertsWithCounts = alertItems.map(item => ({ ...item, count: 0 }));
    } finally {
      isLoading = false;
    }
  }
  
  function applyFilters() {
    if (showNewOnly) {
      // Create a filtered copy of alertsData where each alert's details are filtered
      filteredAlertsData = alertsData.map(alert => {
        const filteredDetails = alert.details.filter(detail => detail.is_notified === false);
        return {
          ...alert,
          count: filteredDetails.length,
          details: filteredDetails
        };
      });
    } else {
      filteredAlertsData = [...alertsData];
    }
    
    // Update the counts in alertsWithCounts
    alertsWithCounts = alertItems.map(item => {
      const data = filteredAlertsData.find((data: AlertData) => data.id === item.id);
      return {
        ...item,
        count: data ? data.count : 0
      };
    });
    
    // If we have a selected alert, update its details too
    if (selectedAlertId) {
      const alertData = filteredAlertsData.find(data => data.id === selectedAlertId);
      selectedAlertDetails = alertData ? alertData.details : [];
      
      // Extract unique queries and cameras from the selected details
      uniqueQueries = [...new Set(selectedAlertDetails.map(detail => detail.query))];
      uniqueCameras = [...new Set(selectedAlertDetails.map(detail => detail.camera_id))]
        .filter(camera => camera); // Filter out undefined/null/empty cameras
      
      applyDetailFilters();
    }
  }
  
  // Update the detail filters to handle multiple selections
  function applyDetailFilters() {
    // Start with all details
    let filtered = [...selectedAlertDetails];
    
    // Apply query filters if any are selected
    if (selectedQueries.length > 0) {
      filtered = filtered.filter(detail => selectedQueries.includes(detail.query));
    }
    
    // Apply camera filters if any are selected
    if (selectedCameras.length > 0) {
      filtered = filtered.filter(detail => selectedCameras.includes(detail.camera_id));
    }
    
    // Apply max results limit
    filtered = filtered.slice(0, maxResults);
    
    filteredAlertDetails = filtered;
  }

  // Toggle a query selection
  function toggleQuery(query: string) {
    if (selectedQueries.includes(query)) {
      selectedQueries = selectedQueries.filter(q => q !== query);
    } else {
      selectedQueries = [...selectedQueries, query];
    }
    applyDetailFilters();
  }
  
  // Toggle a camera selection
  function toggleCamera(camera: string) {
    if (selectedCameras.includes(camera)) {
      selectedCameras = selectedCameras.filter(c => c !== camera);
    } else {
      selectedCameras = [...selectedCameras, camera];
    }
    applyDetailFilters();
  }
  
  // Reset all filters
  function resetFilters() {
    selectedQueries = [];
    selectedCameras = [];
    applyDetailFilters();
  }

  onMount(() => {
    // Initial fetch
    fetchAlertData();
    
    // Set up interval for periodic refreshes
    refreshInterval = window.setInterval(() => {
      fetchAlertData();
    }, 30000);
    
    // Clean up interval on component destruction
    return () => {
      clearInterval(refreshInterval);
    };
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
    const alertData = filteredAlertsData.find(data => data.id === alertId);
    selectedAlertDetails = alertData ? alertData.details : [];
    applyDetailFilters(); // Apply filters to the selected details
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
      const date = new Date(timestamp);
      const istOffset = 5 * 60 * 60 * 1000; 
      const istDate = new Date(date.getTime() + istOffset + 30 * 60 * 1000); 
      // Check if the IST date is greater than the current date
      if (istDate > new Date()) {
        return format(timestamp, 'MMM dd, yyyy HH:mm:ss'); // Use the usual timestamp
      }
      return format(istDate, 'MMM dd, yyyy HH:mm:ss');
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

  // Add this function to handle image loading errors
  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
  }
  
  // Add this function to preload images
  async function preloadImage(src: string): Promise<string> {
    return new Promise((resolve) => {
      if (!src) {
        resolve('');
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(src);
      img.onerror = () => resolve('');
      
      img.src = src;
    });
  }
  
  // Preload images when alert details change
  $: if (selectedAlertDetails.length > 0) {
    selectedAlertDetails.forEach(detail => {
      if (detail.thumb_path) preloadImage(detail.thumb_path);
      if (detail.thumbnail) preloadImage(detail.thumbnail);
    });
  }

  // Add this function to calculate time ago
  function getTimeAgo(timestamp: string): string {
    if (!timestamp) return 'N/A';
    
    try {
      let  date = new Date(timestamp + ' UTC'); // Convert to UTC
      const indianTimeOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time offset in milliseconds
      const indianDate = new Date(date.getTime() + indianTimeOffset); // Convert to Indian Time
      date=indianDate;

      const now = new Date();
      if(date>now){
        date=new Date(timestamp+' UTC');
      }
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } catch (e) {
      return 'N/A';
    }
  }
</script>

<div class="flex flex-col gap-3 p-2 h-full">

  {#if showCards}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 {isFullscreen ? 'xl:grid-cols-4 2xl:grid-cols-5' : 'xl:grid-cols-2'} gap-3 stat-cards-container">
      {#each alertsWithCounts.length ? alertsWithCounts : alertItems as alert}
        <Card.Root 
          class="stat-card overflow-hidden {alert.count ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-30'}"
          onclick={() => alert.count && handleCardClick(alert.id)}
        >
          <Card.Header class="p-0 flex flex-row items-center justify-between">
            <div class="bg-[#1E293B] text-lg text-white font-bold h-9 w-full flex items-center justify-center">
              {#if isLoading}
                <Loader2 class="h-8 w-8 animate-spin text-primary" />
            {:else}
              {alert.count ?? 0}
              {/if}
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
  {:else}
    <div class="w-full">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold">
          {alertItems.find(item => item.id === selectedAlertId)?.mainTitle}
        </h2>
        <button 
          class="px-2.5 py-0.5 bg-muted rounded-md text-xs font-medium hover:bg-muted/80"
          onclick={handleBackClick}
        >
          Back
        </button>
      </div>
      
      <div class="space-y-3 mb-4">
        {#if uniqueQueries.length > 0 || uniqueCameras.length > 0}
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-medium">Filters</h3>
            {#if selectedQueries.length > 0 || selectedCameras.length > 0}
              <button 
                class="text-xs text-primary underline"
                onclick={resetFilters}
              >
                Reset Filters
              </button>
            {/if}
          </div>
        {/if}
        
        <div class="grid grid-cols-1 {isFullscreen ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4">
          {#if uniqueQueries.length > 0}
            <div class="relative">
              <label for="query-filter" class="text-xs font-medium block mb-1">Filter by Event Type:</label>
              <div class="relative">
                <button 
                  id="query-filter"
                  class="flex justify-between items-center w-full px-3 py-2 text-sm border rounded-md bg-background"
                  onclick={() => document.getElementById('query-dropdown')?.classList.toggle('hidden')}
                  type="button"
                >
                  <span>
                    {selectedQueries.length === 0 
                      ? 'All Event Types' 
                      : selectedQueries.length === 1 
                        ? selectedQueries[0] 
                        : `${selectedQueries.length} types selected`}
                  </span>
                  <ChevronDown class="h-4 w-4" />
                </button>
                
                <div id="query-dropdown" class="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg hidden max-h-60 overflow-y-auto">
                  <div class="p-2 space-y-1">
                    {#each uniqueQueries as query}
                      <div class="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm cursor-pointer" onclick={() => toggleQuery(query)}>
                        <Checkbox.Root checked={selectedQueries.includes(query)} id={`query-${query}`} />
                        <label for={`query-${query}`} class="text-sm cursor-pointer flex-1">{query}</label>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
              
              {#if selectedQueries.length > 0}
                <div class="flex flex-wrap gap-1 mt-2">
                  {#each selectedQueries as query}
                    <div class="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                      {query}
                      <button onclick={() => toggleQuery(query)} class="text-muted-foreground hover:text-foreground">
                        <X class="h-3 w-3" />
                      </button>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
          
          {#if uniqueCameras.length > 0}
            <div class="relative">
              <label for="camera-filter" class="text-xs font-medium block mb-1">Filter by Camera:</label>
              <div class="relative">
                <button 
                  id="camera-filter"
                  class="flex justify-between items-center w-full px-3 py-2 text-sm border rounded-md bg-background"
                  onclick={() => document.getElementById('camera-dropdown')?.classList.toggle('hidden')}
                  type="button"
                >
                  <span>
                    {selectedCameras.length === 0 
                      ? 'All Cameras' 
                      : selectedCameras.length === 1 
                        ? selectedCameras[0] 
                        : `${selectedCameras.length} cameras selected`}
                  </span>
                  <ChevronDown class="h-4 w-4" />
                </button>
                
                <div id="camera-dropdown" class="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg hidden max-h-60 overflow-y-auto">
                  <div class="p-2 space-y-1">
                    {#each uniqueCameras as camera}
                      <div class="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm cursor-pointer" onclick={() => toggleCamera(camera)}>
                        <Checkbox.Root checked={selectedCameras.includes(camera)} id={`camera-${camera}`} />
                        <label for={`camera-${camera}`} class="text-sm cursor-pointer flex-1">{camera}</label>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
              
              {#if selectedCameras.length > 0}
                <div class="flex flex-wrap gap-1 mt-2">
                  {#each selectedCameras as camera}
                    <div class="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                      {camera}
                      <button onclick={() => toggleCamera(camera)} class="text-muted-foreground hover:text-foreground">
                        <X class="h-3 w-3" />
                      </button>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
          
          {#if isFullscreen}
            <!-- Additional filters could go here -->
          {/if}
        </div>
      </div>
      
      {#if filteredAlertDetails.length === 0}
        <div class="text-center p-6 bg-muted rounded-lg">
          <p>No details available for this alert.</p>
        </div>
      {:else}
        <div class="space-y-3 {isFullscreen ? 'md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3' : ''}">
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
                      loading="eager"
                      onerror={handleImageError}
                    />
                  </div>
                {/if}
                <div class="p-3 flex-1">
                  <div class="flex flex-col gap-1.5">
                    <h3 class="text-base font-bold">{detail.query}</h3>
                    <p class="text-xs text-muted-foreground">Camera: <span class="font-bold text-white bg-[#1E293B] rounded-md px-1 p-1">{detail.camera_id?.split('_').join(' ') || 'N/A'}</span></p>
                    <p class="text-xs font-medium text-primary">{getTimeAgo(detail.start_timestamp)}</p>
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
            onerror={handleImageError}
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