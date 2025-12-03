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

	type IconElement =
		| { type: 'path'; attrs: Record<string, string> }
		| { type: 'text'; text: string; attrs: Record<string, string> };

	type FileIcon = {
		color: string;
		bg: string;
		viewBox: string;
		elements: IconElement[];
	};

	const documentOutline = (): IconElement[] => [
		{
			type: 'path',
			attrs: {
				d: 'M14 4h14l10 10v30a4 4 0 01-4 4H14a4 4 0 01-4-4V8a4 4 0 014-4z',
				fill: 'none',
				stroke: 'currentColor',
				'stroke-width': '3',
				'stroke-linejoin': 'round',
			},
		},
		{
			type: 'path',
			attrs: {
				d: 'M28 4v12h12',
				fill: 'none',
				stroke: 'currentColor',
				'stroke-width': '3',
				'stroke-linejoin': 'round',
			},
		},
	];

	const labelElement = (label: string): IconElement => ({
		type: 'text',
		text: label,
		attrs: {
			x: '24',
			y: '34',
			'font-size': '12',
			'font-weight': '700',
			'text-anchor': 'middle',
			'dominant-baseline': 'middle',
			fill: 'currentColor',
		},
	});

	const createDocumentIcon = (
		label: string,
		color: string,
		bg: string,
		extra: IconElement[] = []
	): FileIcon => ({
		color,
		bg,
		viewBox: '0 0 48 48',
		elements: [...documentOutline(), ...extra, labelElement(label)],
	});

	function getFileIcon(fileTypeName: string): FileIcon {
		const type = fileTypeName.toLowerCase();

		if (type.includes('pdf')) {
			return createDocumentIcon(
				'PDF',
				'text-red-600 dark:text-red-400',
				'bg-red-100 dark:bg-red-900/30',
				[
					{
						type: 'path',
						attrs: {
							d: 'M16 26h16 M16 32h12',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
							'stroke-linecap': 'round',
						},
					},
				]
			);
		} else if (type.includes('doc')) {
			return createDocumentIcon(
				'DOC',
				'text-blue-600 dark:text-blue-400',
				'bg-blue-100 dark:bg-blue-900/30',
				[
					{
						type: 'path',
						attrs: {
							d: 'M16 24h18 M16 30h14 M16 36h20',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
							'stroke-linecap': 'round',
						},
					},
				]
			);
		} else if (type.includes('ppt')) {
			return createDocumentIcon(
				'PPT',
				'text-orange-600 dark:text-orange-400',
				'bg-orange-100 dark:bg-orange-900/30',
				[
					{
						type: 'path',
						attrs: {
							d: 'M16 33l6-7 6 7 6-6',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
							'stroke-linecap': 'round',
							'stroke-linejoin': 'round',
						},
					},
				]
			);
		} else if (type.includes('xls')) {
			return createDocumentIcon(
				'XLS',
				'text-green-600 dark:text-green-400',
				'bg-green-100 dark:bg-green-900/30',
				[
					{
						type: 'path',
						attrs: {
							d: 'M16 26h18 M16 32h18 M25 24v14 M33 24v14',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
							'stroke-linecap': 'round',
						},
					},
				]
			);
		} else if (type.includes('image') || type.includes('jpg') || type.includes('png')) {
			return {
				color: 'text-purple-600 dark:text-purple-400',
				bg: 'bg-purple-100 dark:bg-purple-900/30',
				viewBox: '0 0 48 48',
				elements: [
					{
						type: 'path',
						attrs: {
							d: 'M8 12h32a2 2 0 012 2v22a2 2 0 01-2 2H8a2 2 0 01-2-2V14a2 2 0 012-2z',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
							'stroke-linejoin': 'round',
						},
					},
					{
						type: 'path',
						attrs: {
							d: 'M20 20a4 4 0 118 0 4 4 0 01-8 0z',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
						},
					},
					{
						type: 'path',
						attrs: {
							d: 'M8 34l10-12 9 11 5-6 10 13',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
							'stroke-linejoin': 'round',
						},
					},
				],
			};
		} else if (type.includes('zip') || type.includes('archive')) {
			return createDocumentIcon(
				'ZIP',
				'text-yellow-600 dark:text-yellow-400',
				'bg-yellow-100 dark:bg-yellow-900/30',
				[
					{
						type: 'path',
						attrs: {
							d: 'M16 16h16v16h-16z M24 16v16 M16 24h16',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
						},
					},
				]
			);
		} else {
			return {
				color: 'text-gray-600 dark:text-gray-400',
				bg: 'bg-gray-100 dark:bg-gray-700',
				viewBox: '0 0 48 48',
				elements: [
					...documentOutline(),
					{
						type: 'path',
						attrs: {
							d: 'M16 28h18 M16 34h12',
							fill: 'none',
							stroke: 'currentColor',
							'stroke-width': '3',
							'stroke-linecap': 'round',
						},
					},
				],
			};
		}
	}
</script>

<svelte:head>
	<title>{data.subject.name} - {data.class.name} | OAV Bibina Knowledge Hub</title>
	<meta
		name="description"
		content="Download notes and study materials for {data.subject.name} in {data.class
			.name}. Access PDFs, documents, and other academic resources."
	/>
	<meta
		property="og:title"
		content="{data.subject.name} - {data.class.name} | OAV Bibina Knowledge Hub"
	/>
	<meta
		property="og:description"
		content="Download notes and study materials for {data.subject.name} in {data.class
			.name}. Access PDFs, documents, and other academic resources."
	/>
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="glass sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<div class="flex items-center gap-4">
				<a
					href="/{createSlug(data.class.name)}/"
					class="group p-2 rounded-lg hover:bg-white/20 transition-colors"
					aria-label="Back to Home"
				>
					<div
						class="w-10 h-10 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:border-brand-blue group-hover:text-brand-blue transition-all"
					>
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
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
								aria-hidden="true"
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
									aria-hidden="true"
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
								aria-hidden="true"
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
					<div class="glass rounded-3xl p-6">
						<h2
							class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-200/30 dark:border-gray-700/30 pb-2"
						>
							<span class="mr-2">📂</span>
							{type}s
						</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each notes as note}
								{@const icon = getFileIcon(type)}
								<div
									class="flex items-center p-4 rounded-2xl bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors group border border-transparent hover:border-brand-blue/50"
								>
									<div
										class="w-12 h-12 rounded-xl {icon.bg} dark:bg-opacity-30 flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform"
									>
										<svg
											class="w-8 h-8 {icon.color} dark:text-opacity-90"
											fill="none"
											stroke="currentColor"
											viewBox={icon.viewBox}
											aria-hidden="true"
										>
											{#each icon.elements as element}
												{#if element.type === 'path'}
													<path {...element.attrs} />
												{:else if element.type === 'text'}
													<text {...element.attrs}>{element.text}</text>
												{/if}
											{/each}
										</svg>
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
										aria-label="Download {note.display_name}"
									>
										<svg
											class="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
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
				class="text-center py-12 glass rounded-3xl border-2 border-dashed border-gray-200/50 dark:border-gray-700/50"
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
		<a class="glass-btn-secondary inline-flex items-center" href="/{createSlug(data.class.name)}">
			<svg
				class="w-4 h-4 mr-2"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
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
