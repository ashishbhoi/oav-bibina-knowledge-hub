<script lang="ts">
	import { enhance } from '$app/forms';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	interface Props {
		form?: {
			message?: string;
			username?: string;
		};
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Admin Login | OAV Bibina Knowledge Hub</title>
	<meta
		name="description"
		content="Administrator login for OAV Bibina Knowledge Hub content management."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200"
>
	<div class="absolute top-4 right-4">
		<ThemeToggle />
	</div>

	<div class="max-w-md w-full space-y-8">
		<div class="flex flex-col items-center">
			<div
				class="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-brand-blue/20"
			>
				OB
			</div>
			<h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				Admin Login
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
				OAV Bibina Knowledge Hub Administration
			</p>
		</div>

		<form
			action="?/login"
			class="mt-8 space-y-6"
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label class="sr-only" for="username">Username</label>
					<input
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm transition-colors"
						id="username"
						name="username"
						placeholder="Username"
						required
						type="text"
						value={form?.username || ''}
					/>
				</div>
				<div>
					<label class="sr-only" for="password">Password</label>
					<input
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm transition-colors"
						id="password"
						name="password"
						placeholder="Password"
						required
						type="password"
					/>
				</div>
			</div>

			{#if form?.message}
				<div
					class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800"
				>
					<div class="flex">
						<div class="flex-shrink-0">
							<svg
								class="h-5 w-5 text-red-400 dark:text-red-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-red-800 dark:text-red-200">
								{form.message}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<div>
				<button
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-blue/20"
					disabled={loading}
					type="submit"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					{/if}
					Sign in
				</button>
			</div>
		</form>
	</div>
</div>
