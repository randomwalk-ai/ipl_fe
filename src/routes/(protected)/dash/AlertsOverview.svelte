<script lang="ts">
  import AlertCards from '$lib/components/AlertCards.svelte';
  import { alertItems } from '$lib/data/alertItems';
</script>

<div class="container mx-auto border border-[#1E293B] rounded-lg p-0">
  <!-- Border only on top -->
  <h1 class="text-2xl w-full font-bold mb-6 bg-[#1E293B] p-4 rounded-t-lg  text-white">Alerts Overview</h1>
  
  <AlertCards {alertItems} />
</div> 