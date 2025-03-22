<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";

  type $$Props = DialogPrimitive.CloseProps;
</script>

<DialogPrimitive.Close {...$$restProps}>
  <slot />
</DialogPrimitive.Close> 