<script lang="ts">
  import { cn } from "$lib/utils";
  import { Check } from "@lucide/svelte";
  
  export let checked: boolean = false;
  export let id: string | undefined = undefined;
  export let disabled: boolean = false;
  
  let className = '';
  export { className as class };
</script>

<div class={cn("flex items-center", className)}>
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    data-state={checked ? "checked" : "unchecked"}
    {disabled}
    {id}
    on:click={() => !disabled && (checked = !checked)}
    class="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
  >
    {#if checked}
      <Check class="h-4 w-4" />
    {/if}
  </button>
</div> 