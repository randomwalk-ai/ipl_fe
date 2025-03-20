<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { getPageState } from '$lib/stores/index.svelte';
	import { Eye, EyeClosed } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';

	const pageState = getPageState();
	pageState.title = 'Login';

	let email = $state('');
	let password = $state('');

	let isLoading = $state(false);
	let passwordVisible = $state(false);

	const zodSchema = z.object({
		email: z.string().email(),
		password: z.string().min(8)
	});

	const handleLogin = async () => {
		const parseResp = zodSchema.safeParse({
			email,
			password
		});
		if (parseResp.error) {
			toast.error(parseResp.error.message);
			return;
		}
		toast.loading('Logging in...', { id: 'login' });
		isLoading = true;
		const { data, error } = await authClient.signIn.email({ email, password });
		if (error) {
			console.error(error);
			toast.error(error.message ?? 'Failed to login', { id: 'login' });
			isLoading = false;
			return;
		}
		toast.success(`Welcome back ${data.user.name}!`, { id: 'login' });
		goto('/dash');
	};
</script>

<div class="flex h-[100dvh] w-full items-center justify-center px-4">
	<Card.Root class="mx-auto max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						bind:value={email}
						autocomplete="email"
						id="email"
						type="email"
						placeholder="m@example.com"
						required
					/>
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
					</div>
					<div class="relative w-full">
						<Input
							id="password"
							bind:value={password}
							type={passwordVisible ? 'text' : 'password'}
							required
							autocomplete="current-password"
						/>
						{#if passwordVisible}
							<Eye
								class="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
								onclick={() => (passwordVisible = !passwordVisible)}
							/>
						{:else}
							<EyeClosed
								class="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
								onclick={() => (passwordVisible = !passwordVisible)}
							/>
						{/if}
					</div>
				</div>
				<Button disabled={isLoading} type="button" onclick={handleLogin} class="w-full"
					>Login</Button
				>
				<Button
					disabled={isLoading}
					type="button"
					variant="outline"
					class="w-full"
					onclick={async (e) => {
						e.preventDefault();
						await authClient.signIn.social({
							provider: 'github',
							callbackURL: '/dash' //redirect to dashboard after sign in
						});
					}}>Login with Github</Button
				>
			</form>
			<div class="mt-4 text-center text-sm">
				Don't have an account?
				<a href="/signup" class="underline"> Sign up </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>