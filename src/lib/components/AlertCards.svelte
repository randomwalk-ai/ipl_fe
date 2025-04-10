<script lang="ts">
  import { onMount } from 'svelte';
  import * as Card from '$lib/components/ui/card';
  import { 
    FlagIcon, 
    PawPrintIcon, 
    FootprintsIcon, 
    BanIcon, 
    UsersIcon, 
    FlameIcon, 
    AlertTriangleIcon, 
    PackageIcon, 
    SwordIcon 
  } from '@lucide/svelte';

  type AlertItem = {
    id: string;
    mainTitle: string;
    alertTitle: string | string[];
    description: string;
    icon: string;
    count?: number;
  };

  export let alertItems: AlertItem[] = [];
  let alertsWithCounts: AlertItem[] = [];

  const iconMap = {
    FlagIcon,
    PawPrintIcon,
    FootprintsIcon,
    BanIcon,
    UsersIcon,
    FlameIcon,
    AlertTriangleIcon,
    PackageIcon,
    SwordIcon
  };

  onMount(async () => {
    try {
      const response = await fetch('/api/alerts-data');
      if (!response.ok) {
        throw new Error('Failed to fetch alert data');
      }
      
      const alertCounts = await response.json();
      
      // Merge the counts with the alert items
      alertsWithCounts = alertItems.map(item => {
        const countData = alertCounts.find(count => count.id === item.id);
        return {
          ...item,
          count: countData ? countData.count : 0
        };
      });
    } catch (error) {
      console.error('Error fetching alert data:', error);
      // If there's an error, just use the original items with count 0
      alertsWithCounts = alertItems.map(item => ({ ...item, count: 0 }));
    }
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
  {#each alertsWithCounts.length ? alertsWithCounts : alertItems as alert}
    <Card.Root class="overflow-hidden">
      <Card.Header class="p-0 flex flex-row items-center justify-between">
        <div class="bg-[#1E293B] text-xl text-white font-bold h-12 w-full flex items-center justify-center">
          {alert.count ?? 0}
        </div>
      </Card.Header>

      <Card.Footer class="p-4 flex justify-between items-center">
        <Card.Title class="text-sm">{alert.mainTitle}</Card.Title>
        <div class="bg-primary/10 p-2 rounded-full">
          {#if alert.icon && iconMap[alert.icon]}
            <svelte:component this={iconMap[alert.icon]} class="h-5 w-5 text-primary" />
          {:else}
            <AlertTriangleIcon class="h-5 w-5 text-primary" />
          {/if}
        </div>

      </Card.Footer>
    </Card.Root>
  {/each}
</div> 