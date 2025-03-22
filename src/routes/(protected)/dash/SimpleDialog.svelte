<script lang="ts">
  import { X } from '@lucide/svelte';
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let title = '';
  export let size = "auto"; // Options: "auto", "sm", "md", "lg", "xl"
  export let fullHeight = false; // Whether to use full height or adapt to content
  export let fullWidth = false; // Whether to use full width (90vw) or size classes

  const dispatch = createEventDispatcher();

  function close() {
    open = false;
    dispatch('close');
  }

  // Close on escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) close();
  }

  // Map size to CSS classes
  const sizeClasses = {
    auto: "w-auto max-w-[90vw]",
    sm: "w-full max-w-sm",
    md: "w-full max-w-md",
    lg: "w-full max-w-lg",
    xl: "w-full max-w-xl"
  };
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div 
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    transition:fade={{ duration: 150 }}
    on:click|self={close}
  >
    <div 
      class={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${fullWidth ? 'w-[90vw]' : sizeClasses[size]} overflow-hidden ${fullHeight ? 'max-h-[90vh] h-[80vh]' : ''}`}
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
      <div class={`p-4 overflow-auto ${fullHeight ? 'h-[calc(100%-4rem)]' : ''}`}>
        <slot />
      </div>
    </div>
  </div>
{/if} 