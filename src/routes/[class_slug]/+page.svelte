<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	interface Props {
		data: {
			class: {
				id: number;
				name: string;
				created_at: string;
			};
			subjects: Array<{
				id: number;
				name: string;
				slug: string;
				class_id: number;
				created_at: string;
			}>;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.class.name} - Subjects | OAV Bibina Knowledge Hub</title>
	<meta
		name="description"
		content="Browse subjects and study materials for {data.class
			.name}. Access comprehensive notes and academic resources."
	/>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="glass sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div class="flex items-center gap-4">
				<a
					href="/"
					class="group p-2 rounded-lg hover:bg-white/20 transition-colors"
					aria-label="Back to Home"
				>
					<div
						class="w-10 h-10 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:border-brand-blue group-hover:text-brand-blue transition-all"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							></path>
						</svg>
					</div>
				</a>
				<div class="font-bold text-xl text-gray-900 dark:text-white">Knowledge Hub</div>
			</div>
			<ThemeToggle />
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
		<div class="mb-8">
			<nav class="flex mb-4" aria-label="Breadcrumb">
				<ol class="inline-flex items-center space-x-1 md:space-x-3">
					<li class="inline-flex items-center">
						<a
							href="/"
							class="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue"
						>
							<svg
								class="w-4 h-4 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
								><path
									d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
								></path></svg
							>
							Home
						</a>
					</li>
					<li>
						<div class="flex items-center">
							<svg
								class="w-6 h-6 text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
								><path
									fill-rule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
									clip-rule="evenodd"
								></path></svg
							>
							<span class="ml-1 text-sm font-medium text-gray-700 dark:text-gray-200 md:ml-2"
								>{data.class.name}</span
							>
						</div>
					</li>
				</ol>
			</nav>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
				<span class="mr-3 text-4xl">📖</span>
				{data.class.name} Subjects
			</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-300">
				Select a subject to view available notes and resources.
			</p>
		</div>

		<!-- Subjects Grid -->
		{#if data.subjects.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.subjects as subject}
					<a
						href="/{data.class.name
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, '-')
							.replace(/(^-|-$)/g, '')}/{subject.slug}"
						class="group glass-card border-2 border-transparent hover:border-brand-green relative overflow-hidden"
					>
						<div
							class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-green/10 to-brand-blue/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"
						></div>

						<div class="relative z-10">
							<div class="flex items-center justify-between mb-4">
								<div
									class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-brand-green text-xl font-bold group-hover:bg-brand-green group-hover:text-white transition-colors duration-300"
								>
									{subject.name.charAt(0)}
								</div>
							</div>
							<h3
								class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-green transition-colors"
							>
								{subject.name}
							</h3>
							<p class="text-gray-500 dark:text-gray-400 text-sm">Click to explore materials</p>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div
				class="text-center py-12 glass rounded-3xl border-2 border-dashed border-gray-200/50 dark:border-gray-700/50"
			>
				<div class="text-6xl mb-4 animate-bounce">🔍</div>
				<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No Subjects Found</h3>
				<p class="text-gray-500 dark:text-gray-400">
					It looks like there are no subjects for this class yet.
				</p>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="glass mt-auto border-t-0">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="text-center">
				<p class="text-gray-500 dark:text-gray-100 text-sm font-medium">
					Made with 💙 for Students
				</p>
				<p class="text-gray-400 dark:text-gray-300 text-xs mt-2">
					&copy; 2025 OAV Bibina Knowledge Hub
				</p>
			</div>
		</div>
	</footer>
</div>
