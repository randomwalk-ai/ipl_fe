<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { page } from '$app/state';
	import Logout from './Logout.svelte';
	import ModeToggle from './ModeToggle.svelte';
	const sidebar = useSidebar();
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Image src={page.data.user?.image} alt={page.data.user?.name} />
							<Avatar.Fallback class="rounded-lg"
								>{(page.data.user?.name as string)
									.split(' ')
									.map((name) => name[0])
									.join('')}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{page.data.user?.name}</span>
							<span class="truncate text-xs">{page.data.user?.email}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="h-8 w-8 rounded-lg">
							<Avatar.Image src={page.data.user?.image} alt={page.data.user?.name} />
							<Avatar.Fallback class="rounded-lg"
								>{(page.data.user?.name as string)
									.split(' ')
									.map((name) => name[0])
									.join('')}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{page.data.user?.name}</span>
							<span class="truncate text-xs">{page.data.user?.email}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<Separator />
				<DropdownMenu.Item class="mt-1">
					<Logout />
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<ModeToggle />
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>