
<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { authClient } from '$lib/auth-client';

	import LogOut from '@lucide/svelte/icons/log-out';
	import { toast } from 'svelte-sonner';
</script>

<form
	method="post"
	onsubmit={(e) => {
		e.preventDefault();
		authClient.signOut();
	}}
	class="items flex w-full pl-1"
>
	<button class="flex w-full items-center gap-2">
		<LogOut size={15} />
		Logout
	</button>
</form>
