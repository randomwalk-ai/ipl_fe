<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { cn } from "$lib/utils";
  import { fade } from "svelte/transition";

  type $$Props = DialogPrimitive.Props;

  export let open = false;
  export let onOpenChange: DialogPrimitive.OnOpenChangeHandler = undefined;
</script>

<DialogPrimitive.Root
  bind:open
  {onOpenChange}
  {...$$restProps}
>
  <slot />
</DialogPrimitive.Root> 