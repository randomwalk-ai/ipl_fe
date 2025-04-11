<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let value: number[] = [0];
	export let min = 0;
	export let max = 100;
	export let step = 1;
	export let disabled = false;
	export let className: string = undefined;
	
	const dispatch = createEventDispatcher();
	
	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = [parseInt(target.value, 10)];
		value = newValue;
		dispatch('valueChange', newValue);
	}
</script>

<div class="relative flex w-full touch-none select-none items-center {className ?? ''}">
	<input
		type="range"
		{min}
		{max}
		{step}
		{disabled}
		value={value[0]}
		on:input={handleChange}
		class="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer"
	/>
</div> 