<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	interface Props {
		data: {
			classes: Array<{
				id: number;
				name: string;
				slug: string;
				created_at: string;
			}>;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>OAV Bibina Knowledge Hub - Select Your Class</title>
	<meta
		name="description"
		content="Browse and access academic materials for different classes. Choose your class to view subjects and study notes."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<!-- Header -->
	<header
		class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<a href="/" class="flex items-center gap-3 group">
				<div
					class="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-200"
				>
					OB
				</div>
				<h1
					class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-brand-blue transition-colors"
				>
					Knowledge Hub
				</h1>
			</a>
			<ThemeToggle />
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Hero Section -->
		<div
			class="bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 dark:from-brand-blue/20 dark:to-brand-purple/20 rounded-3xl p-8 mb-12 text-center relative overflow-hidden"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-yellow rounded-full opacity-20 blur-xl animate-pulse"
			></div>
			<div
				class="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-brand-green rounded-full opacity-20 blur-xl animate-pulse delay-700"
			></div>

			<div class="relative z-10">
				<span
					class="inline-block bg-white dark:bg-gray-800 px-4 py-1 rounded-full text-sm font-bold text-brand-purple mb-4 shadow-sm animate-bounce"
				>
					👋 Welcome Students!
				</span>
				<h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
					Your Learning Journey <span class="text-brand-blue">Starts Here</span>
				</h1>
				<p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					Access all your study materials, notes, and resources in one fun and easy-to-use place.
				</p>
			</div>
		</div>

		<!-- Class Selection -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
				<span class="mr-2">📚</span> Select Your Class
			</h2>

			{#if data.classes.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.classes as classItem}
						<a
							href="/{classItem.slug}"
							class="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-brand-blue"
						>
							<div class="flex items-start justify-between mb-4">
								<div
									class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300"
								>
									{classItem.name.charAt(0)}
								</div>
								<div
									class="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-brand-blue transition-colors"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										></path>
									</svg>
								</div>
							</div>
							<h3
								class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-blue transition-colors"
							>
								{classItem.name}
							</h3>
							<p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
								Access notes, papers, and more for {classItem.name}.
							</p>
						</a>
					{/each}
				</div>
			{:else}
				<div
					class="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"
				>
					<div
						class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
					>
						<span class="text-4xl">📚</span>
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Classroom is Empty!</h3>
					<p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
						Looks like the teachers haven't added any classes yet. Check back soon for your study
						materials! 📚
					</p>
				</div>
			{/if}
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="text-center">
				<p class="text-gray-500 text-sm font-medium">Made with 💙 for Students</p>
				<p class="text-gray-400 text-xs mt-2">&copy; 2025 OAV Bibina Knowledge Hub</p>
			</div>
		</div>
	</footer>
</div>
