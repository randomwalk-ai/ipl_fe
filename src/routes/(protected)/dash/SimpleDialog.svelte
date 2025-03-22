<script lang="ts">
  import { X } from '@lucide/svelte';
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let title = '';

  const dispatch = createEventDispatcher();

  function close() {
    open = false;
    dispatch('close');
  }

  // Close on escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div 
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    transition:fade={{ duration: 150 }}
    on:click|self={close}
  >
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-[90vw] max-h-[90vh] h-[80vh] overflow-hidden"
      on:click|stopPropagation
    >
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-lg font-semibold">{title}</h2>
        <button 
          class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          on:click={close}
        >
          <X class="h-5 w-5" />
          <span class="sr-only">Close</span>
        </button>
      </div>
      <div class="p-4 h-[calc(100%-4rem)] overflow-auto">
        <slot />
      </div>
    </div>
  </div>
{/if} 