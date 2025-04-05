<script lang="ts">
    import * as echarts from 'echarts';
    import { mode } from 'mode-watcher';
    import { onDestroy, onMount } from 'svelte';
    import type { TweetsData } from '../types';
    import dayjs from 'dayjs';

    // Accept any tweets array that may have nullable fields
    // This handles both the TweetsData type and the actual DB return type
    type Props = {
        tweets: Array<{
            tweetId: string;
            tweetUser: string | null;
            tweetDate: string | null;
            sentiment: 'positive' | 'negative' | 'neutral' | null;
            [key: string]: any;
        }>;
    };

    let { tweets }: Props = $props();
    let echartsContainer: HTMLDivElement | null = $state(null);
    let expandedChartContainer: HTMLDivElement | null = $state(null);
    let chart: echarts.ECharts | null = $state(null);
    let expandedChart: echarts.ECharts | null = $state(null);
    let resizeObserver: ResizeObserver | null = $state(null);
    let expandedResizeObserver: ResizeObserver | null = $state(null);
    let isLoading = $state(true);
    let isExpanded = $state(false);
    
    // Process the tweet data to create time series data for 30-minute intervals over the last 24 hours
    let timeSeriesData = $derived.by(() => {
        if (!tweets || tweets.length === 0) {
            return {
                times: [],
                positive: [],
                negative: []
            };
        }

        // Create 48 intervals (30 minutes each) for the last 24 hours
        const intervals = 48;
        const now = dayjs();
        const oneDayAgo = now.subtract(24, 'hour');
        
        // Create an array of intervals (30 minute periods)
        const timeIntervals = [];
        const positiveData = Array(intervals).fill(0);
        const negativeData = Array(intervals).fill(0);
        
        // Create all interval timestamps
        for (let i = 0; i < intervals; i++) {
            const time = oneDayAgo.add(i * 30, 'minute');
            timeIntervals.push(time.format('YYYY-MM-DD HH:mm'));
        }
        
        // Process tweets and assign them to their corresponding interval
        tweets.forEach(tweet => {
            if (!tweet.tweetDate) return;
            
            const tweetTime = dayjs(tweet.tweetDate);
            
            // Only process tweets from the last 24 hours
            if (tweetTime.isAfter(oneDayAgo)) {
                // Calculate which interval this tweet belongs to
                const minutesSinceStart = tweetTime.diff(oneDayAgo, 'minute');
                const intervalIndex = Math.floor(minutesSinceStart / 30);
                
                // Make sure the index is valid (could be out of range if the tweet is very recent)
                if (intervalIndex >= 0 && intervalIndex < intervals) {
                    if (tweet.sentiment === 'positive') {
                        positiveData[intervalIndex]++;
                    } else if (tweet.sentiment === 'negative') {
                        negativeData[intervalIndex]++;
                    }
                }
            }
        });
        
        return {
            times: timeIntervals,
            positive: positiveData,
            negative: negativeData
        };
    });

    // Chart options for the small chart (without x-axis labels)
    let options: echarts.EChartsOption = $derived.by(
        () =>
            ({
                darkMode: $mode === 'dark',
                responsive: true,
                maintainAspectRatio: false,
                backgroundColor: 'transparent',
                color: ['#22c55e', '#ef4444'], // Green for positive, Red for negative
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: $mode === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: $mode === 'dark' ? '#334155' : '#e2e8f0',
                    textStyle: {
                        color: $mode === 'dark' ? '#e2e8f0' : '#334155'
                    },
                    formatter: function(params) {
                        const time = dayjs(params[0].name).format('HH:mm');
                        let content = `Time: ${time}<br/>`;
                        params.forEach(item => {
                            content += `${item.seriesName}: ${item.value}<br/>`;
                        });
                        return content;
                    }
                },
                legend: {
                    data: ['Positive', 'Negative'],
                    textStyle: {
                        color: $mode === 'dark' ? '#94a3b8' : '#475569'
                    }
                },
                grid: {
                    left: '2%',
                    right: '2%',
                    bottom: '10%',
                    top: '40',
                    containLabel: true,
                    borderColor: $mode === 'dark' ? '#2d3748' : '#cbd5e1'
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: timeSeriesData.times,
                    axisLine: {
                        lineStyle: {
                            color: $mode === 'dark' ? '#2d3748' : '#cbd5e1'
                        }
                    },
                    axisLabel: {
                        show: false // Hide x-axis labels in the small view
                    },
                    axisTick: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    min: 0,
                    splitNumber: 3,
                    axisLabel: {
                        formatter: '{value}',
                        color: $mode === 'dark' ? '#94a3b8' : '#475569'
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
                        name: 'Positive',
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
                                        color: '#22c55e' // Green
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgba(34, 197, 94, 0.1)' // Light Green
                                    }
                                ]
                            }
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: timeSeriesData.positive
                    },
                    {
                        name: 'Negative',
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
                                        color: '#ef4444' // Red
                                    },
                                    {
                                        offset: 1,
                                        color: 'rgba(239, 68, 68, 0.1)' // Light Red
                                    }
                                ]
                            }
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: timeSeriesData.negative
                    }
                ]
            }) as echarts.EChartsOption
    );

    // Chart options for the expanded view (with x-axis labels)
    let expandedOptions: echarts.EChartsOption = $derived.by(
        () => {
            const opts = JSON.parse(JSON.stringify(options));
            // Show x-axis labels in expanded view
            opts.xAxis.axisLabel = {
                show: true,
                color: $mode === 'dark' ? '#94a3b8' : '#475569',
                formatter: function(value) {
                    return dayjs(value).format('HH:mm');
                },
                interval: function(index) {
                    // Show label every hour (2 intervals of 30 min)
                    return index % 2 === 0;
                }
            };
            // Adjust grid for more space
            opts.grid = {
                left: '3%',
                right: '3%',
                bottom: '12%',
                top: '60',
                containLabel: true,
                borderColor: $mode === 'dark' ? '#2d3748' : '#cbd5e1'
            };
            // Show more details in tooltip
            opts.tooltip = {
                trigger: 'axis',
                backgroundColor: $mode === 'dark' ? '#1e293b' : '#ffffff',
                borderColor: $mode === 'dark' ? '#334155' : '#e2e8f0',
                textStyle: {
                    color: $mode === 'dark' ? '#e2e8f0' : '#334155'
                },
                formatter: function(params) {
                    const time = dayjs(params[0].name).format('MMM DD, HH:mm');
                    let content = `<div class="font-semibold">${time}</div>`;
                    params.forEach(item => {
                        const color = item.seriesName === 'Positive' ? '#22c55e' : '#ef4444';
                        content += `<div style="display: flex; align-items: center; margin-top: 4px;">
                            <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-right: 6px;"></span>
                            <span style="font-weight: 500;">${item.seriesName}:</span> <span style="margin-left: 4px;">${item.value}</span>
                        </div>`;
                    });
                    return content;
                }
            };
            return opts as echarts.EChartsOption;
        }
    );

    function toggleExpand() {
        isExpanded = !isExpanded;
        if (isExpanded) {
            // Wait for DOM to update
            setTimeout(() => {
                initExpandedChart();
            }, 50);
        }
    }

    function initExpandedChart() {
        if (expandedChartContainer) {
            expandedChart = echarts.init(expandedChartContainer, $mode === 'dark' ? 'dark' : null, {
                renderer: 'svg'
            });
            expandedChart.setOption(expandedOptions);
            
            expandedResizeObserver = new ResizeObserver(() => {
                if (expandedChart && expandedChartContainer) {
                    expandedChart.resize();
                }
            });
            
            expandedResizeObserver.observe(expandedChartContainer);
        }
    }

    $effect(() => {
        if (chart) {
            chart.setOption(options);
        }
        if (expandedChart) {
            expandedChart.setOption(expandedOptions);
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
        
        // Set loading to false after a short delay to ensure the chart has rendered
        setTimeout(() => {
            isLoading = false;
        }, 300);
    });

    onDestroy(() => {
        // Clean up resources
        if (chart) {
            chart.dispose();
        }
        if (expandedChart) {
            expandedChart.dispose();
        }
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
        if (expandedResizeObserver) {
            expandedResizeObserver.disconnect();
        }
    });
</script>

<div class="w-full h-48 relative">
    {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-gray-800 rounded">
        <div class="text-xs text-gray-300">Loading chart...</div>
    </div>
    {/if}
    
    <!-- Expand Button -->
    <button 
        class="absolute top-0 right-0 z-10 p-1 bg-gray-800 bg-opacity-60 hover:bg-opacity-80 rounded text-white text-xs flex items-center justify-center transition-all duration-200"
        on:click={toggleExpand}
        title="Expand Chart"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
        </svg>
    </button>
    
    <div bind:this={echartsContainer} class="h-full w-full"></div>
    
    <!-- Expanded Chart Modal -->
    {#if isExpanded}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div class="relative bg-gray-900 w-[90vw] h-[80vh] rounded-lg p-4">
                <button 
                    class="absolute top-2 right-2 z-10 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-white flex items-center justify-center transition-all duration-200"
                    on:click={toggleExpand}
                    title="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h3 class="text-white text-lg font-semibold mb-3">Sentiment Trends - Last 24 Hours</h3>
                <div bind:this={expandedChartContainer} class="h-[calc(100%-3rem)] w-full"></div>
            </div>
        </div>
    {/if}
</div> 