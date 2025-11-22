<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	interface Props {
		data: {
			class: {
				id: number;
				name: string;
				created_at: string;
			};
			subject: {
				id: number;
				name: string;
				class_id: number;
				created_at: string;
			};
			groupedNotes: Record<
				string,
				Array<{
					id: number;
					display_name: string;
					r2_object_key: string;
					class_id: number;
					subject_id: number;
					file_type_id: number;
					uploaded_at: string;
					class_name?: string;
					subject_name?: string;
					file_type_name?: string;
				}>
			>;
		};
	}

	let { data }: Props = $props();
	let expandedSections: Record<string, boolean> = $state({});

	function toggleSection(fileType: string) {
		expandedSections[fileType] = !expandedSections[fileType];
	}

	function createSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function getFileIcon(fileName: string) {
		const ext = fileName.split('.').pop()?.toLowerCase() || '';

		const icons = {
			pdf: {
				color: 'text-red-600',
				bg: 'bg-red-100 group-hover:bg-red-200',
				path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
			},
			doc: {
				color: 'text-blue-600',
				bg: 'bg-blue-100 group-hover:bg-blue-200',
				path: 'M15.41 19.09l-2.83-2.83-2.83 2.83-1.41-1.41 2.83-2.83-2.83-2.83 1.41-1.41 2.83 2.83 2.83-2.83 1.41 1.41-2.83 2.83 2.83 2.83-1.41 1.41z M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
			},
			docx: {
				color: 'text-blue-600',
				bg: 'bg-blue-100 group-hover:bg-blue-200',
				path: 'M15.41 19.09l-2.83-2.83-2.83 2.83-1.41-1.41 2.83-2.83-2.83-2.83 1.41-1.41 2.83 2.83 2.83-2.83 1.41 1.41-2.83 2.83 2.83 2.83-1.41 1.41z M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
			},
			xls: {
				color: 'text-green-600',
				bg: 'bg-green-100 group-hover:bg-green-200',
				path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z M10 14h4v2h-4v-2z M10 10h4v2h-4v-2z',
			},
			xlsx: {
				color: 'text-green-600',
				bg: 'bg-green-100 group-hover:bg-green-200',
				path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z M10 14h4v2h-4v-2z M10 10h4v2h-4v-2z',
			},
			ppt: {
				color: 'text-orange-600',
				bg: 'bg-orange-100 group-hover:bg-orange-200',
				path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z M10 12h4 M10 15h4',
			},
			pptx: {
				color: 'text-orange-600',
				bg: 'bg-orange-100 group-hover:bg-orange-200',
				path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z M10 12h4 M10 15h4',
			},
			jpg: {
				color: 'text-purple-600',
				bg: 'bg-purple-100 group-hover:bg-purple-200',
				path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
			},
			jpeg: {
				color: 'text-purple-600',
				bg: 'bg-purple-100 group-hover:bg-purple-200',
				path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
			},
			png: {
				color: 'text-purple-600',
				bg: 'bg-purple-100 group-hover:bg-purple-200',
				path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
			},
			zip: {
				color: 'text-yellow-600',
				bg: 'bg-yellow-100 group-hover:bg-yellow-200',
				path: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
			},
		};

		return (
			icons[ext as keyof typeof icons] || {
				color: 'text-gray-600',
				bg: 'bg-gray-100 group-hover:bg-gray-200',
				path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
			}
		);
	}
</script>

<svelte:head>
	<title>{data.subject.name} - {data.class.name} | OAV Bibina Knowledge Hub</title>
	<meta
		name="description"
		content="Download notes and study materials for {data.subject.name} in {data.class
			.name}. Access PDFs, documents, and other academic resources."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<!-- Header -->
	<header
		class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div class="flex items-center gap-4">
				<a
					href="/{createSlug(data.class.name)}/"
					class="group p-2 rounded-lg hover:bg-gray-100 transition-colors"
					aria-label="Back to Home"
				>
					<div
						class="w-10 h-10 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:border-brand-blue group-hover:text-brand-blue transition-all"
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
				<div class="font-bold text-xl text-gray-900 dark:text-white">{data.class.name}</div>
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
							<a
								href="/{createSlug(data.class.name)}/"
								class="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue"
							>
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
							</a>
						</div>
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
								>{data.subject.name}</span
							>
						</div>
					</li>
				</ol>
			</nav>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				📚 {data.subject.name} : {data.class.name}
			</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-1">Click on any file to download it</p>
		</div>

		{#if Object.keys(data.groupedNotes).length > 0}
			<div class="space-y-6">
				{#each Object.entries(data.groupedNotes) as [type, notes]}
					<div
						class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
					>
						<h2
							class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-100 dark:border-gray-700 pb-2"
						>
							<span class="mr-2">📂</span>
							{type}s
						</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each notes as note}
								{@const icon = getFileIcon(note.display_name)}
								<div
									class="flex items-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group border border-transparent hover:border-brand-blue"
								>
									<div
										class="w-12 h-12 rounded-xl {icon.bg} flex items-center justify-center {icon.color} mr-4 shadow-sm group-hover:scale-110 transition-transform"
									>
										<i class="fas {icon.path} text-xl"></i>
									</div>
									<div class="flex-1 min-w-0">
										<h3
											class="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-blue transition-colors"
										>
											{note.display_name}
										</h3>
										<p class="text-xs text-gray-500 dark:text-gray-400">
											{new Date(note.uploaded_at).toLocaleDateString()}
										</p>
									</div>
									<a
										href="/download/{note.id}"
										class="ml-4 p-2 text-gray-400 hover:text-brand-blue dark:text-gray-500 dark:hover:text-brand-blue transition-colors"
										title="Download"
										download
									>
										<svg
											class="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
											></path></svg
										>
									</a>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700"
			>
				<div class="text-6xl mb-4 animate-bounce">📭</div>
				<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No Notes Available</h3>
				<p class="text-gray-500 dark:text-gray-400">
					There are currently no notes uploaded for this subject.
				</p>
			</div>
		{/if}
	</main>

	<!-- Back Button -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
		<a
			class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:focus:ring-gray-600"
			href="/{createSlug(data.class.name)}"
		>
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
				></path>
			</svg>
			Back to {data.class.name}
		</a>
	</div>

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
