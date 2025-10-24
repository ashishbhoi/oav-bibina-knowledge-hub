<script lang="ts">
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
</script>

<svelte:head>
	<title>{data.subject.name} - {data.class.name} | OAV Bibina Knowledge Hub</title>
	<meta
		name="description"
		content="Download notes and study materials for {data.subject.name} in {data.class
			.name}. Access PDFs, documents, and other academic resources."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
				<a class="hover:text-blue-600" href="/">Home</a>
				<span>/</span>
				<a class="hover:text-blue-600" href="/{createSlug(data.class.name)}">{data.class.name}</a>
				<span>/</span>
				<span class="text-gray-900">{data.subject.name}</span>
			</nav>
			<h1 class="text-3xl font-bold text-center text-gray-900">
				{data.subject.name} - Study Materials
			</h1>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="text-center mb-8">
			<h2 class="text-2xl font-semibold text-gray-700 mb-2">Available Materials</h2>
			<p class="text-gray-600">Click on any file to download it</p>
		</div>

		{#if Object.keys(data.groupedNotes).length > 0}
			<div class="space-y-6">
				{#each Object.entries(data.groupedNotes) as [fileType, notes]}
					<div class="bg-white rounded-lg shadow-md border border-gray-200">
						<button
							onclick={() => toggleSection(fileType)}
							class="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-3">
									<div
										class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
									>
										<svg
											class="w-5 h-5 text-purple-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
											></path>
										</svg>
									</div>
									<div>
										<h3 class="text-lg font-semibold text-gray-900">
											{fileType}
										</h3>
										<p class="text-sm text-gray-500">
											{notes.length}
											file{notes.length !== 1 ? 's' : ''}
										</p>
									</div>
								</div>
								<svg
									class="w-5 h-5 text-gray-400 transition-transform duration-200 {expandedSections[
										fileType
									]
										? 'rotate-180'
										: ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</div>
						</button>

						{#if expandedSections[fileType]}
							<div class="px-6 pb-4">
								<div class="border-t border-gray-200 pt-4">
									<div class="grid gap-3">
										{#each notes as note}
											<a
												href="/download/{note.id}"
												rel="external"
												class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 group"
											>
												<div class="flex items-center space-x-3">
													<div
														class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200"
													>
														<svg
															class="w-4 h-4 text-blue-600"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
															></path>
														</svg>
													</div>
													<div>
														<p class="font-medium text-gray-900">
															{note.display_name}
														</p>
														<p class="text-sm text-gray-500">
															Uploaded: {new Date(note.uploaded_at).toLocaleDateString()}
														</p>
													</div>
												</div>
												<svg
													class="w-5 h-5 text-gray-400 group-hover:text-blue-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
													></path>
												</svg>
											</a>
										{/each}
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-12">
				<div
					class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<svg
						class="w-12 h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						></path>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No Materials Available</h3>
				<p class="text-gray-500">
					Study materials for this subject will appear here once they are uploaded.
				</p>
			</div>
		{/if}
	</main>

	<!-- Back Button -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
		<a
			class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
	<footer class="bg-white border-t mt-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="text-center text-gray-500 text-sm">
				<p>&copy; 2025 OAV Bibina Knowledge Hub. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
