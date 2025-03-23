<script lang="ts">
	import * as echarts from 'echarts';
	import { mode } from 'mode-watcher';
	import { onDestroy, onMount } from 'svelte';
	import type { AttendanceData } from '../../types';

	type Props = {
		timeData: AttendanceData;
	};

	let { timeData }: Props = $props();
	let echartsContainer: HTMLDivElement | null = $state(null);
	let chart: echarts.ECharts | null = $state(null);
	let resizeObserver: ResizeObserver | null = $state(null);
	let options: echarts.EChartsOption = $derived.by(
		() =>
			({
				darkMode: $mode === 'dark',
				responsive: true,
				maintainAspectRatio: false,
				backgroundColor: 'transparent',
				// Updated default colors.  These are overridden by the series-specific colors below.
				color: ['#39FF14', '#FFFF3C', '#004B8D'], // Gray/Green, Yellow, Blue
				tooltip: {
					trigger: 'axis',
					backgroundColor: $mode === 'dark' ? '#1e293b' : '#ffffff',
					borderColor: $mode === 'dark' ? '#334155' : '#e2e8f0',
					textStyle: {
						color: $mode === 'dark' ? '#e2e8f0' : '#334155'
					}
				},
				legend: {
					data: ['Incoming', 'CSK', 'MI'],
					textStyle: {
						color: $mode === 'dark' ? '#94a3b8' : '#475569'
					}
				},
				grid: {
					left: '2%',
					right: '2%',
					bottom: '20%',
					top: '30',
					containLabel: true,
					borderColor: $mode === 'dark' ? '#2d3748' : '#cbd5e1'
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					data: timeData.times,
					axisLine: {
						lineStyle: {
							color: $mode === 'dark' ? '#2d3748' : '#cbd5e1'
						}
					},
					axisLabel: {
						color: $mode === 'dark' ? '#94a3b8' : '#475569'
					},
					axisTick: {
						show: false
					}
				},
				yAxis: {
					type: 'value',
					min: 0,
					max: Math.ceil(1.1 * Math.max(...timeData.incoming, 0)),
					splitNumber: 4,
					axisLabel: {
						formatter: '{value}',
						color: $mode === 'dark' ? '#94a3b8' : '#475569',
						inside: false,
						padding: [0, 0, 0, 0]
					},
					splitLine: {
						lineStyle: {
							color: $mode === 'dark' ? '#2d3748' : '#cbd5e1',
							type: 'dashed'
						}
					},
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					}
				},
				series: [
					{
						name: 'Incoming',
						type: 'line',
						smooth: true,
						lineStyle: {
							width: 2
						},
						areaStyle: {
							opacity: 0.4,
							color: {
								type: 'linear',
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [
									{
										offset: 0,
										color: '#39FF14' // Gray/Green - CHOOSE YOUR PREFERRED SHADE
									},
									{
										offset: 1,
										color: 'rgba(113, 128, 150, 0.1)' // Lightened version of the same gray/green
									}
								]
							}
						},
						emphasis: {
							focus: 'series'
						},
						data: timeData.incoming
					},
					{
						name: 'CSK',
						type: 'line',
						smooth: true,
						lineStyle: {
							width: 2
						},
						areaStyle: {
							opacity: 0.4,
							color: {
								type: 'linear',
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [
									{
										offset: 0,
										color: '#FFFF3C' // Yellow
									},
									{
										offset: 1,
										color: 'rgba(255, 255, 60, 0.1)' // Light Yellow
									}
								]
							}
						},
						emphasis: {
							focus: 'series'
						},
						data: timeData.team1
					},
					{
						name: 'MI',
						type: 'line',
						smooth: true,
						lineStyle: {
							width: 2
						},
						areaStyle: {
							opacity: 0.4,
							color: {
								type: 'linear',
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [
									{
										offset: 0,
										color: '#004B8D' // Blue
									},
									{
										offset: 1,
										color: 'rgba(0, 75, 141, 0.1)' // Light Blue
									}
								]
							}
						},
						emphasis: {
							focus: 'series'
						},
						data: timeData.team2
					}
				]
			}) as echarts.EChartsOption
	);

	$effect(() => {
		if (chart) {
			chart.setOption(options);
		}
	});

	onMount(() => {
		chart = echarts.init(echartsContainer, $mode === 'dark' ? 'dark' : null, {
			renderer: 'svg' // Use SVG renderer for better scaling
		});
		// Create ResizeObserver to handle chart resizing
		resizeObserver = new ResizeObserver(() => {
			if (chart && echartsContainer) {
				chart.resize();
			}
		});

		// Start observing the container
		resizeObserver.observe(echartsContainer!);
	});

	onDestroy(() => {
		// Clean up resources
		if (chart) {
			chart.dispose();
		}
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
	});
</script>

<div bind:this={echartsContainer} class="h-full w-full shrink grow"></div>
