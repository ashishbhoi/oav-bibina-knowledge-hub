<script lang="ts">
	interface Props {
		data: {
			classes: Array<{
				id: number;
				name: string;
				slug: string;
				created_at: string;
				subject_count?: number;
				file_count?: number;
			}>;
			stats?: {
				totalClasses: number;
				totalSubjects: number;
				totalFiles: number;
			};
		};
	}

	let { data }: Props = $props();

	// Calculate stats if not provided by server
	const stats = data.stats || {
		totalClasses: data.classes.length,
		totalSubjects: 0, // Placeholder as we don't have this data directly in the current load
		totalFiles: 0, // Placeholder
	};
</script>

<svelte:head>
	<title>Dashboard | Admin | OAV Bibina Knowledge Hub</title>
	<meta name="description" content="Admin dashboard for managing classes and content." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
		<p class="text-gray-600 dark:text-gray-400 mt-2">
			Welcome back! Here's what's happening in your knowledge hub.
		</p>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex items-center"
		>
			<div
				class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					></path>
				</svg>
			</div>
			<div>
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Classes</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClasses}</p>
			</div>
		</div>

		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex items-center"
		>
			<div
				class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mr-4"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					></path>
				</svg>
			</div>
			<div>
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subjects</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">--</p>
			</div>
		</div>

		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex items-center"
		>
			<div
				class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					></path>
				</svg>
			</div>
			<div>
				<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded Files</p>
				<p class="text-2xl font-bold text-gray-900 dark:text-white">--</p>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<a
			class="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md hover:border-brand-blue transition-all duration-200"
			href="/admin/settings?tab=classes"
		>
			<div class="flex items-center mb-4">
				<div
					class="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors text-brand-blue"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						></path>
					</svg>
				</div>
			</div>
			<h3
				class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors"
			>
				Add Class
			</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new class section</p>
		</a>

		<a
			class="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md hover:border-brand-green transition-all duration-200"
			href="/admin/settings?tab=subjects"
		>
			<div class="flex items-center mb-4">
				<div
					class="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors text-brand-green"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						></path>
					</svg>
				</div>
			</div>
			<h3
				class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-green transition-colors"
			>
				Add Subject
			</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new subject</p>
		</a>

		<a
			class="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md hover:border-brand-purple transition-all duration-200"
			href="/admin/upload"
		>
			<div class="flex items-center mb-4">
				<div
					class="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors text-brand-purple"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						></path>
					</svg>
				</div>
			</div>
			<h3
				class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-purple transition-colors"
			>
				Upload Files
			</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Add study materials</p>
		</a>

		<a
			class="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md hover:border-brand-yellow transition-all duration-200"
			href="/admin/files"
		>
			<div class="flex items-center mb-4">
				<div
					class="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-white transition-colors text-brand-yellow"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						></path>
					</svg>
				</div>
			</div>
			<h3
				class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-yellow transition-colors"
			>
				Manage Files
			</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Edit and delete files</p>
		</a>
	</div>

	<!-- Classes Overview -->
	<div
		class="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
	>
		<div
			class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50"
		>
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Classes</h2>
			<a
				href="/admin/settings"
				class="text-sm font-medium text-brand-blue hover:text-blue-700 dark:hover:text-blue-400"
				>View All</a
			>
		</div>

		{#if data.classes.length > 0}
			<div class="divide-y divide-gray-100 dark:divide-gray-700">
				{#each data.classes as classItem}
					<div
						class="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4 sm:gap-0"
					>
						<div class="flex items-center space-x-4 w-full sm:w-auto">
							<div
								class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold flex-shrink-0"
							>
								{classItem.name.charAt(0)}
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="text-base font-medium text-gray-900 dark:text-white truncate">
									{classItem.name}
								</h3>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Created: {new Date(classItem.created_at).toLocaleDateString()}
								</p>
							</div>
						</div>

						<div class="flex items-center space-x-3 w-full sm:w-auto justify-end">
							<a
								href="/{classItem.slug}"
								target="_blank"
								class="text-gray-400 hover:text-brand-blue transition-colors"
								title="View Public Page"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									></path>
								</svg>
							</a>
							<div class="h-4 w-px bg-gray-200"></div>
							<a
								href="/admin/upload?class_id={classItem.id}"
								class="text-sm font-medium text-brand-purple hover:text-purple-700"
							>
								Upload
							</a>
							<a
								href="/admin/files?class_id={classItem.id}"
								class="text-sm font-medium text-brand-green hover:text-green-700"
							>
								Manage
							</a>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="px-6 py-12 text-center">
				<div
					class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						></path>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No Classes Created</h3>
				<p class="text-gray-500 mb-4">Get started by creating your first class.</p>
				<a
					href="/admin/settings"
					class="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
				>
					Create First Class
				</a>
			</div>
		{/if}
	</div>
</div>
