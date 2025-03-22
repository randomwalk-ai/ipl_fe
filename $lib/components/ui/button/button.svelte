<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<button 
  on:click={(e) => dispatch('click', e)}
>
  <slot />
</button> 