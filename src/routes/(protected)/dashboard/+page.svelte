<script lang="ts">
  import { onMount } from 'svelte';
	import { PUBLIC_RUNPOD_BASE_URL } from '$env/static/public';
  
  let iframeLoaded = $state(false);
  let loadError = $state(false);
  
  
  function handleIframeLoad() {
    iframeLoaded = true;
  }
  
  function handleIframeError() {
    loadError = true;
  }
</script>
  
  <div class="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    {#if !iframeLoaded && !loadError}
      <div class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p class="text-white">Loading dashboard...</p>
        </div>
      </div>
    {/if}
    
    {#if loadError}
      <div class="p-8 text-center">
        <div class="text-red-400 text-xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Failed to load the dashboard
        </div>
        <p class="text-gray-400 mb-6">There was an error loading the external dashboard. Please try again later.</p>
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          on:click={() => {
            loadError = false;
            iframeLoaded = false;
            setTimeout(() => {
              const iframe = document.getElementById('dashboard-iframe') as HTMLIFrameElement;
              if (iframe) {
                iframe.src = iframe.src;
              }
            }, 100);
          }}
        >
          Retry
        </button>
      </div>
    {/if}
    
    <iframe
      id="dashboard-iframe"
      src="https://iplsingham.z29.web.core.windows.net/dashboard"
      class="w-full border-none"
      style="height: 80vh; min-height: 600px;"
      on:load={handleIframeLoad}
      on:error={handleIframeError}
      title="External Dashboard"
    ></iframe>
  </div>
  

