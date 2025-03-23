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

	// let options: ApexOptions = $derived.by(() => ({
	// 	chart: {
	// 		type: 'area',
	// 		height: 250,
	// 		toolbar: {
	// 			show: false
	// 		},
	// 		background: 'transparent', // Always transparent for seamless switching
	// 		redrawOnParentResize: true,
	// 		redrawOnWindowResize: true
	// 	},
	// 	colors: ['#3b82f6', '#be185d'], // Colors don't change based on theme
	// 	dataLabels: {
	// 		enabled: false
	// 	},
	// 	stroke: {
	// 		curve: 'smooth',
	// 		width: 2
	// 	},
	// 	series: [
	// 		{
	// 			name: 'Incoming',
	// 			data: timeData.incoming
	// 		},
	// 		{
	// 			name: 'CSK',
	// 			data: timeData.team1
	// 		},
	// 		{
	// 			name: 'MI',
	// 			data: timeData.team2
	// 		}
	// 		// {
	// 		// 	name: 'Outgoing',
	// 		// 	data: timeData.outgoing
	// 		// }
	// 	],
	// 	xaxis: {
	// 		categories: timeData.times,
	// 		tickAmount: 10,
	// 		labels: {
	// 			style: {
	// 				colors: $mode === 'dark' ? '#94a3b8' : '#475569' // Ternary for labels
	// 			},
	// 		},
	// 		axisBorder: {
	// 			show: false
	// 		},
	// 		axisTicks: {
	// 			show: false
	// 		}
	// 	},
	// 	yaxis: {
	// 		labels: {
	// 			style: {
	// 				colors: $mode === 'dark' ? '#94a3b8' : '#475569' // Ternary for labels
	// 			},
	// 			formatter: (val: number) => val.toFixed(0)
	// 		},
	// 		tickAmount: 4,
	// 		min: 0,
	// 		max: 1.1 * Math.max(...timeData.incoming, 0)
	// 	},
	// 	grid: {
	// 		borderColor: $mode === 'dark' ? '#2d3748' : '#cbd5e1', // Ternary for grid
	// 		strokeDashArray: 4,
	// 		yaxis: {
	// 			lines: {
	// 				show: true
	// 			}
	// 		},
	// 		xaxis: {
	// 			lines: {
	// 				show: false
	// 			}
	// 		}
	// 	},
	// 	legend: {
	// 		labels: {
	// 			colors: $mode === 'dark' ? '#94a3b8' : '#475569' // Ternary for legend
	// 		}
	// 	},
	// 	fill: {
	// 		type: 'gradient',
	// 		gradient: {
	// 			opacityFrom: 0.4,
	// 			opacityTo: 0.1
	// 		}
	// 	},
	// 	tooltip: {
	// 		theme: $mode === 'dark' ? 'dark' : 'light' // Ternary for tooltip
	// 	}
	// }));

	let options: echarts.EChartsOption = $derived.by(
		() =>
			({
				darkMode: $mode === 'dark',
				responsive: true,
				maintainAspectRatio: false,
				backgroundColor: 'transparent',
				color: ['#3b82f6', '#be185d'],
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
					left: '2%', // Reduced from 3% to 1%
					right: '2%', // Reduced from 4% to 2%
					bottom: '20%', // Reduced from 3% to 2%
					top: '30', // Reduced from 40 to 30
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
						inside: false, // Keep labels outside
						padding: [0, 0, 0, 0] // Minimize padding around labels
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
					// Series configurations remain unchanged
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
										color: '#3b82f6'
									},
									{
										offset: 1,
										color: 'rgba(59, 130, 246, 0.1)'
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
										color: '#be185d'
									},
									{
										offset: 1,
										color: 'rgba(190, 24, 93, 0.1)'
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
										color: '#be185d'
									},
									{
										offset: 1,
										color: 'rgba(190, 24, 93, 0.1)'
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
