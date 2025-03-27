<script lang="ts">
  import { onMount } from 'svelte';
  
  // State variables
  let searchQuery = $state('');
  let searchResults = $state<any[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let searchTypes = $state(['image', 'description']);
  let limit = $state(20);
  
  // Handle search form submission
  async function handleSearch(event: Event) {
    event.preventDefault();
    
    if (!searchQuery.trim()) {
      error = 'Please enter a search query';
      return;
    }
    
    error = null;
    isLoading = true;
    
    try {
      // Call our backend API endpoint instead of the external service directly
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: limit,
          search_type: searchTypes
        })
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      searchResults = data;
      
    } catch (err) {
      console.error('Search error:', err);
      error = err instanceof Error ? err.message : 'An error occurred during search';
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }
  
  // Toggle search type selection
  function toggleSearchType(type: string) {
    if (searchTypes.includes(type)) {
      searchTypes = searchTypes.filter(t => t !== type);
    } else {
      searchTypes = [...searchTypes, type];
    }
    
    // Ensure at least one search type is selected
    if (searchTypes.length === 0) {
      searchTypes = [type];
    }
  }
</script>

<div class="container mx-auto p-4 h-full">
  <h1 class="text-2xl font-bold mb-6 text-white">Search</h1>
  
  <!-- Search Form -->
  <form on:submit={handleSearch} class="mb-8">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-grow">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search for objects, events, etc..."
          class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <button
          type="submit"
          class="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="inline-block animate-spin mr-2">⟳</span>Searching...
          {:else}
            Search
          {/if}
        </button>
      </div>
    </div>
    
    <!-- Search Options -->
    <div class="mt-4 flex flex-wrap gap-4">
      <div class="flex items-center">
        <span class="text-gray-300 mr-2">Limit:</span>
        <select 
          bind:value={limit}
          class="bg-gray-800 border border-gray-700 text-white rounded-md px-2 py-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      
      <div class="flex items-center gap-4">
        <span class="text-gray-300">Search in:</span>
        <label class="inline-flex items-center">
          <input 
            type="checkbox" 
            checked={searchTypes.includes('image')} 
            on:change={() => toggleSearchType('image')}
            class="form-checkbox h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
          />
          <span class="ml-2 text-gray-300">Images</span>
        </label>
        
        <label class="inline-flex items-center">
          <input 
            type="checkbox" 
            checked={searchTypes.includes('description')} 
            on:change={() => toggleSearchType('description')}
            class="form-checkbox h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
          />
          <span class="ml-2 text-gray-300">Descriptions</span>
        </label>
      </div>
    </div>
  </form>
  
  <!-- Error Message -->
  {#if error}
    <div class="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
      <p>{error}</p>
    </div>
  {/if}
  
  <!-- Search Results -->
  {#if searchResults.length > 0}
    <h2 class="text-xl font-semibold mb-4 text-white">Results ({searchResults.length})</h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {#each searchResults as result }
        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div class="relative aspect-video">
            <img 
              src={`data:image/jpeg;base64,${result.image_base64}`} 
              alt="Search result" 
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-3">
            <!-- Show metadata.stream_id -->
            <p class="text-gray-400 text-xs">Stream ID: {result.metadata.stream_id}</p>
            <p class="text-gray-400 text-xs">Score: {result.score.toFixed(2)}</p>
            <!-- Show metadata.description first 30 characters and on hover show the full description -->
            <p class="text-gray-400 text-xs">{result.metadata.description.slice(0, 30)}</p>
            <!-- On hover show the full description as a tooltip -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p class="text-gray-300 text-sm">{result.metadata.description}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if !isLoading && searchQuery && !error}
    <div class="bg-gray-800 border-l-4 border-yellow-500 text-yellow-400 p-4 rounded">
      No results found for "{searchQuery}".
    </div>
  {/if}
</div> 