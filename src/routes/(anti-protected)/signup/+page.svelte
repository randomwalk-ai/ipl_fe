<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { authClient } from '$lib/auth-client'; //import the auth client
	import { getPageState } from '$lib/stores/index.svelte';
	import { Eye, EyeClosed } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import { goto } from '$app/navigation';

	const pageState = getPageState();
	pageState.title = 'Sign Up';

	let passwordVisible = $state(false);

	let isLoading = $state(false);
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	const zodSchema = z.object({
		email: z.string().email(),
		password: z.string().min(8),
		name: z.string().min(3)
	});

	const handleSignup = async () => {
		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		const parseResp = zodSchema.safeParse({
			email,
			password,
			name
		});
		if (parseResp.error) {
			toast.error(parseResp.error.message);
			return;
		}
		toast.loading('Signing up...', { id: 'signup' });
		isLoading = true;
		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name
		});
		if (error) {
			console.error(error);
			toast.error(error.message ?? 'Failed to sign up', { id: 'signup' });
			isLoading = false;
			return;
		}
		toast.success('Signed up successfully!', { id: 'signup' });
		goto('/dash');
	};
</script>

<div class="flex h-[100dvh] w-full items-center justify-center px-4">
	<Card.Root class="mx-auto max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Sign Up</Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input
						autocomplete="name"
						id="name"
						bind:value={name}
						type="text"
						placeholder="Gon Freece"
						required
					/>
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						autocomplete="email"
						id="email"
						bind:value={email}
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
							autocomplete="new-password"
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
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="conf-password">Confirm Password</Label>
					</div>
					<Input
						autocomplete="off"
						bind:value={confirmPassword}
						id="conf-password"
						type="password"
						required
					/>
				</div>
				<Button type="button" class="w-full" onclick={handleSignup}>Sign Up</Button>
			</form>
			<div class="mt-4 text-center text-sm">
				Already have an account?
				<a href="/login" class="underline"> Log in </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
