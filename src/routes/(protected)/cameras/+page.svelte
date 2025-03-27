<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  
  // Get from props 
  let { data } = $props();
  let cameras = data.cameras;
  // Make statuses reactive by using $state
  let statuses = $state({} as Record<string, string>);
  let pollingIntervals: Record<string, number> = {};

  // Function to poll camera status
  async function pollCameraStatus(cameraId: string) {
    try {
      const response = await fetch(`/api/cameras/${cameraId}/status`);
      if (response.ok) {
        const data = await response.json();
        
        // Update the status directly
        statuses[cameraId] = data.running ? 'running' : 'stopped';
      } else {
        statuses[cameraId] = 'error';
      }
    } catch (error) {
      console.error(`Error polling camera ${cameraId}:`, error);
      statuses[cameraId] = 'error';
    }
  }
  
  // Start polling for all cameras
  onMount(() => {
    if (!cameras || cameras.length === 0) return;
    
    cameras.forEach((camera: any) => {
      // Initialize status
      statuses[camera.id] = 'loading';
      
      // Poll immediately
      pollCameraStatus(camera.id);
      
      // Set up interval for polling (every 15 seconds)
      pollingIntervals[camera.id] = setInterval(() => {
        pollCameraStatus(camera.id);
      }, 15000) as unknown as number;
    });
  });
  
  // Clean up intervals on component destroy
  onDestroy(() => {
    Object.values(pollingIntervals).forEach(interval => {
      clearInterval(interval);
    });
  });
  
  // Function to toggle camera status
  async function toggleCamera(cameraId: string, currentStatus: string) {
    const action = currentStatus === 'running' ? 'stop' : 'start';
    
    // Set to loading state while toggling
    statuses[cameraId] = 'loading';
    
    try {
      const response = await fetch(`/api/cameras/${cameraId}/${action}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Update status after toggle
        setTimeout(() => pollCameraStatus(cameraId), 1000);
      } else {
        console.error(`Failed to ${action} camera ${cameraId}`);
        // Revert to previous status on error
        statuses[cameraId] = currentStatus;
      }
    } catch (error) {
      console.error(`Error toggling camera ${cameraId}:`, error);
      // Revert to previous status on error
      statuses[cameraId] = currentStatus;
    }
  }
  
  // Helper function to get status color
  function getStatusColor(status: string): string {
    switch(status) {
      case 'running': return 'text-green-400';
      case 'stopped': return 'text-red-400';
      case 'loading': return 'text-blue-400';
      case 'error': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  }
</script>

<div class="container mx-auto p-4 h-full overflow-y-auto">
  <h1 class="text-2xl font-bold mb-6 text-white">Camera Management</h1>
  
  {#if !cameras || cameras.length === 0}
    <div class="bg-gray-800 border-l-4 border-yellow-500 text-yellow-400 p-4 mb-4 rounded">
      No cameras found in the database.
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg shadow">
      <table class="min-w-full bg-gray-800 border border-gray-700">
        <thead>
          <tr>
            <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
            <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 border-b border-gray-700 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          {#each cameras as camera (camera.id)}
            <tr class="bg-gray-800 hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">{camera.id}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">{camera.name || 'Unnamed Camera'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-300">{camera.category || 'Uncategorized'}</td>
              <td class="px-6 py-4 whitespace-nowrap truncate max-w-xs text-gray-300">{camera.url || 'N/A'}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={getStatusColor(statuses[camera.id])}>
                  {statuses[camera.id] || 'unknown'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="sr-only peer" 
                    checked={statuses[camera.id] === 'running'}
                    on:change={() => toggleCamera(camera.id, statuses[camera.id])}
                    disabled={statuses[camera.id] === 'loading'}
                  >
                  <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                  <span class="ml-3 text-sm font-medium text-gray-300">
                    {statuses[camera.id] === 'running' ? 'On' : 'Off'}
                  </span>
                </label>
                <button 
                  class="ml-2 text-blue-400 hover:text-blue-300"
                  on:click={() => pollCameraStatus(camera.id)}
                  disabled={statuses[camera.id] === 'loading'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div> 