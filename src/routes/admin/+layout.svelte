<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	interface Props {
		data: {
			user?: {
				userId: number;
				username: string;
			};
		};
		children: any;
	}

	let { data, children }: Props = $props();
	let showMobileMenu = $state(false);

	const navigation = [
		{
			name: 'Dashboard',
			href: '/admin/dashboard',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		},
		{
			name: 'Upload File',
			href: '/admin/upload',
			icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
		},
		{
			name: 'Manage Files',
			href: '/admin/files',
			icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		},
		{
			name: 'Settings',
			href: '/admin/settings',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
		},
	];
</script>

{#if $page.url.pathname === '/admin'}
	{@render children()}
{:else}
	<div class="min-h-screen flex">
		<!-- Sidebar for Desktop -->
		<aside class="hidden md:flex flex-col w-64 glass border-r-0 fixed h-full z-30">
			<div
				class="flex items-center justify-center h-16 border-b border-gray-200/30 dark:border-gray-700/30 px-4"
			>
				<a href="/admin" class="flex items-center gap-2 group">
					<div
						class="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
					>
						OB
					</div>
					<span
						class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors"
						>Admin Panel</span
					>
				</a>
			</div>

			<nav class="flex-1 overflow-y-auto py-4">
				<ul class="space-y-1 px-2">
					{#each navigation as item}
						<li>
							<a
								href={item.href}
								class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group {$page
									.url.pathname === item.href
									? 'bg-brand-blue/20 text-brand-blue shadow-sm'
									: 'text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white'}"
							>
								<svg
									class="mr-3 h-5 w-5 {$page.url.pathname === item.href
										? 'text-brand-blue'
										: 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={item.icon}
									/>
								</svg>
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<!-- Theme Toggle -->
			<div class="px-2 pb-2">
				<ThemeToggle variant="sidebar" />
			</div>

			<div class="border-t border-gray-200 dark:border-gray-700 p-4">
				<div class="flex items-center mb-4">
					<div
						class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold"
					>
						{data.user?.username?.charAt(0).toUpperCase() || 'A'}
					</div>
					<div class="ml-3">
						<p class="text-sm font-medium text-gray-900 dark:text-white">
							{data.user?.username || 'Admin'}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
					</div>
				</div>
				<form action="/admin?/logout" method="POST">
					<button
						type="submit"
						class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-brand-red bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
					>
						Sign Out
					</button>
				</form>
			</div>
		</aside>

		<!-- Mobile Menu -->
		{#if showMobileMenu}
			<div class="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
				<!-- Backdrop -->
				<div
					class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
					onclick={() => (showMobileMenu = false)}
					aria-hidden="true"
				></div>

				<!-- Sidebar -->
				<div class="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
					<div class="absolute top-0 right-0 -mr-12 pt-2">
						<button
							type="button"
							class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
							onclick={() => (showMobileMenu = false)}
						>
							<span class="sr-only">Close sidebar</span>
							<svg
								class="h-6 w-6 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
						<div class="flex-shrink-0 flex items-center px-4">
							<div
								class="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold mr-2"
							>
								OB
							</div>
							<span class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
						</div>
						<nav class="mt-5 px-2 space-y-1">
							{#each navigation as item}
								<a
									href={item.href}
									class="group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors {$page
										.url.pathname === item.href
										? 'bg-brand-blue/10 text-brand-blue'
										: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}"
									onclick={() => (showMobileMenu = false)}
								>
									<svg
										class="mr-4 h-6 w-6 {$page.url.pathname === item.href
											? 'text-brand-blue'
											: 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d={item.icon}
										/>
									</svg>
									{item.name}
								</a>
							{/each}
						</nav>
					</div>
					<div class="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
						<div class="flex-shrink-0 w-full group block">
							<div class="flex items-center">
								<div
									class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold"
								>
									{data.user?.username?.charAt(0).toUpperCase() || 'A'}
								</div>
								<div class="ml-3">
									<p class="text-base font-medium text-gray-700 dark:text-white">
										{data.user?.username || 'Admin'}
									</p>
									<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Administrator</p>
								</div>
							</div>
							<div class="mt-4">
								<form action="/admin?/logout" method="POST">
									<button
										type="submit"
										class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-brand-red bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
									>
										Sign Out
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
				<div class="flex-shrink-0 w-14">
					<!-- Force sidebar to shrink to fit close icon -->
				</div>
			</div>
		{/if}

		<!-- Main Content Area -->
		<div class="flex-1 md:ml-64 flex flex-col min-h-screen">
			<!-- Mobile Header -->
			<div
				class="md:hidden bg-white/20 dark:bg-gray-900/30 backdrop-blur-lg border-b border-white/30 dark:border-white/10 h-16 flex items-center justify-between px-4 sticky top-0 z-20"
			>
				<div class="flex items-center gap-2">
					<div
						class="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold"
					>
						OB
					</div>
					<span class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
				</div>
				<button
					onclick={() => (showMobileMenu = !showMobileMenu)}
					class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
					aria-label="Toggle mobile menu"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>

			<!-- Page Content -->
			<main class="flex-1 overflow-y-auto p-4 md:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
