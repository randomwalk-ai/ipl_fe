<script lang="ts">
	import { browser } from '$app/environment';
	import type { ApexOptions } from 'apexcharts';
	import { mode } from 'mode-watcher';
	import { onDestroy, onMount } from 'svelte';

	type Props = {
		timeData: {
			times: string[];
			incoming: number[];
			outgoing: number[];
		};
	};

	let { timeData }: Props = $props();
	let chartElement: HTMLElement;

	let options: ApexOptions = $derived.by(() => ({
		chart: {
			type: 'area',
			height: 250,
			toolbar: {
				show: false,
			},
			background: 'transparent', // Always transparent for seamless switching
		},
		colors: ['#3b82f6', '#be185d'], // Colors don't change based on theme
		dataLabels: {
			enabled: false,
		},
		stroke: {
			curve: 'smooth',
			width: 2,
		},
		series: [
			{
				name: 'Incoming',
				data: timeData.incoming,
			},
			{
				name: 'Outgoing',
				data: timeData.outgoing,
			},
		],
		xaxis: {
			categories: timeData.times,
			labels: {
				style: {
					colors: $mode === 'dark' ? '#94a3b8' : '#475569', // Ternary for labels
				},
			},
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		yaxis: {
			labels: {
				style: {
					colors: $mode === 'dark' ? '#94a3b8' : '#475569', // Ternary for labels
				},
			},
			tickAmount: 4,
			min: 0,
			max: 20000,
		},
		grid: {
			borderColor: $mode === 'dark' ? '#2d3748' : '#cbd5e1', // Ternary for grid
			strokeDashArray: 4,
			yaxis: {
				lines: {
					show: true,
				},
			},
			xaxis: {
				lines: {
					show: false,
				},
			},
		},
		legend: {
			labels: {
				colors: $mode === 'dark' ? '#94a3b8' : '#475569', // Ternary for legend
			},
		},
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0.4,
				opacityTo: 0.1,
			},
		},
		tooltip: {
			theme: $mode === 'dark' ? 'dark' : 'light', // Ternary for tooltip
		},
	}));

	let ApexCharts: typeof import('apexcharts') | null = $state(null);
	let chart: ApexCharts | null = $state(null);

	onMount(async () => {
		ApexCharts = (await import('apexcharts')).default;
		chart = new ApexCharts(chartElement, options);
		chart.render();
	});

	$effect(() => {
		if (browser && chart && options) {
			chart.updateOptions(options, false, true);
		}
	});

	onDestroy(() => {
		if (chart) chart.destroy();
	});
</script>

<div bind:this={chartElement} class="h-[250px] w-full"></div>