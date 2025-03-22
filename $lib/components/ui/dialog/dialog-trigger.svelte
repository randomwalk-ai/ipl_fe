<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";

  type $$Props = DialogPrimitive.TriggerProps;
</script>

<DialogPrimitive.Trigger {...$$restProps}>
  <slot />
</DialogPrimitive.Trigger> 