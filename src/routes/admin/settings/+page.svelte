<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	interface Props {
		data: {
			classes: Array<{
				id: number;
				name: string;
				created_at: string;
			}>;
			fileTypes: Array<{
				id: number;
				name: string;
				created_at: string;
			}>;
			subjects: Array<{
				id: number;
				name: string;
				class_id: number;
				class_name: string;
				created_at: string;
			}>;
		};
		form?: any;
	}

	let { data, form }: Props = $props();

	let activeTab = $state($page.url.searchParams.get('tab') || 'classes');
	let editingItem = $state<any>(null);
	let isLoading = $state(false);
	let expandedClasses = $state<Set<number>>(new Set());
	let newSubjectClassId = $state<number | null>(null);

	// Group subjects by class
	const subjectsByClass = $derived(() => {
		const grouped = new Map();
		data.subjects.forEach((subject) => {
			if (!grouped.has(subject.class_id)) {
				grouped.set(subject.class_id, []);
			}
			grouped.get(subject.class_id).push(subject);
		});
		return grouped;
	});

	function startEdit(item: any) {
		editingItem = { ...item };
	}

	function toggleClassExpansion(classId: number) {
		if (expandedClasses.has(classId)) {
			expandedClasses.delete(classId);
		} else {
			expandedClasses.add(classId);
		}
		expandedClasses = new Set(expandedClasses);
	}

	function startAddSubject(classId: number) {
		newSubjectClassId = classId;
		editingItem = { name: '', class_id: classId };
	}

	function cancelEdit() {
		editingItem = null;
	}

	function setActiveTab(tab: string) {
		activeTab = tab;
		editingItem = null;
	}
</script>

<svelte:head>
	<title>Settings | Admin | OAV Bibina Knowledge Hub</title>
	<meta name="description" content="Manage classes, subjects, file types, and admin credentials." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen py-8">
	<!-- Header -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<div
				class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0"
			>
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
					<p class="mt-2 text-gray-600 dark:text-gray-400">
						Manage system configurations and content structure
					</p>
				</div>
				<a
					class="glass-btn-secondary inline-flex items-center w-full sm:w-auto justify-center"
					href="/admin/dashboard"
				>
					← Back to Dashboard
				</a>
			</div>
		</div>

		<!-- Settings Container -->
		<div class="glass rounded-2xl overflow-hidden min-h-[600px]">
			<!-- Content Area -->
			<div class="p-6 md:p-8 bg-white/30 dark:bg-gray-800/30">
				<!-- Success/Error Messages -->
				{#if form?.success}
					<div
						class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-6 py-4 rounded-xl mb-8 flex items-center shadow-sm"
					>
						<div
							class="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3"
						>
							<svg
								class="w-5 h-5 text-green-600 dark:text-green-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						</div>
						<div>
							<strong class="block font-semibold">Success!</strong>
							<span class="text-sm">{form.message}</span>
						</div>
					</div>
				{:else if form?.message}
					<div
						class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-xl mb-8 flex items-center shadow-sm"
					>
						<div
							class="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mr-3"
						>
							<svg
								class="w-5 h-5 text-red-600 dark:text-red-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<div>
							<strong class="block font-semibold">Error</strong>
							<span class="text-sm">{form.message}</span>
						</div>
					</div>
				{/if}

				<!-- Tabs -->
				<div class="border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
					<nav class="-mb-px flex space-x-8" aria-label="Tabs">
						<button
							class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === 'classes'
									? 'border-brand-blue text-brand-blue dark:text-blue-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
							}`}
							onclick={() => setActiveTab('classes')}
						>
							<span class="mr-2">📚</span> Classes
						</button>
						<button
							class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === 'subjects'
									? 'border-brand-blue text-brand-blue dark:text-blue-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
							}`}
							onclick={() => setActiveTab('subjects')}
						>
							<span class="mr-2">📖</span> Subjects
						</button>
						<button
							class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === 'fileTypes'
									? 'border-brand-blue text-brand-blue dark:text-blue-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
							}`}
							onclick={() => setActiveTab('fileTypes')}
						>
							<span class="mr-2">📂</span> File Types
						</button>
						<button
							class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === 'admin'
									? 'border-brand-blue text-brand-blue dark:text-blue-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
							}`}
							onclick={() => setActiveTab('admin')}
						>
							<span class="mr-2">🔐</span> Admin Account
						</button>
					</nav>
				</div>

				<!-- Classes Tab -->
				{#if activeTab === 'classes'}
					<div class="space-y-6">
						<div
							class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-6"
						>
							<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
								Manage Classes
							</h2>

							<!-- Add New Class Form -->
							<form
								method="POST"
								action="?/createClass"
								use:enhance={() => {
									isLoading = true;
									return async ({ update }) => {
										await update();
										isLoading = false;
									};
								}}
								class="mb-8 p-6 bg-white/20 border border-gray-200/30 rounded-xl dark:bg-gray-700/20 dark:border-gray-600/30 backdrop-blur-sm"
							>
								<h3
									class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider dark:text-white"
								>
									Add New Class
								</h3>
								<div class="flex flex-col sm:flex-row gap-4">
									<input
										type="text"
										name="name"
										placeholder="Class Name (e.g., Class 10)"
										required
										class="glass-input flex-1 border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white transition-all"
									/>
									<button
										type="submit"
										disabled={isLoading}
										class="glass-btn px-6 py-2.5 rounded-lg disabled:opacity-50 transition-colors font-medium shadow-sm"
									>
										{isLoading ? 'Adding...' : 'Add Class'}
									</button>
								</div>
							</form>

							<!-- Classes List -->
							<div class="space-y-3">
								{#each data.classes as cls}
									<div
										class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 border border-gray-200/30 rounded-xl hover:border-gray-300/50 transition-colors bg-white/20 dark:bg-gray-800/20 dark:border-gray-700/30 dark:hover:border-gray-600/50 dark:text-white gap-4 sm:gap-0 backdrop-blur-sm"
									>
										{#if editingItem?.id === cls.id}
											<!-- Edit Form -->
											<form
												method="POST"
												action="?/updateClass"
												use:enhance={() => {
													isLoading = true;
													return async ({ update }) => {
														await update();
														isLoading = false;
														editingItem = null;
													};
												}}
												class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1"
											>
												<input type="hidden" name="id" value={cls.id} />
												<input
													type="text"
													name="name"
													value={editingItem.name}
													oninput={(e) => {
														const target = e.target as HTMLInputElement;
														if (target) editingItem.name = target.value;
													}}
													class="glass-input flex-1 border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white"
												/>
												<div class="flex gap-2">
													<button
														type="submit"
														disabled={isLoading}
														class="bg-green-600/80 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700/80 disabled:opacity-50 font-medium flex-1 sm:flex-none backdrop-blur-sm"
													>
														Save
													</button>
													<button
														type="button"
														onclick={cancelEdit}
														class="bg-gray-100/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-200/50 dark:hover:bg-gray-600/50 font-medium flex-1 sm:flex-none backdrop-blur-sm"
													>
														Cancel
													</button>
												</div>
											</form>
										{:else}
											<!-- Display Mode -->
											<div class="flex items-center gap-3">
												<div
													class="w-10 h-10 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-brand-blue dark:text-blue-400 font-bold flex-shrink-0 backdrop-blur-sm"
												>
													{cls.name.charAt(0)}
												</div>
												<span class="font-medium text-gray-900 dark:text-white">{cls.name}</span>
											</div>
											<div class="flex gap-2 justify-end">
												<button
													onclick={() => startEdit(cls)}
													class="text-gray-400 hover:text-brand-blue dark:text-gray-500 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors"
													title="Edit"
												>
													<svg
														class="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-hidden="true"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														></path>
													</svg>
												</button>
												<form
													method="POST"
													action="?/deleteClass"
													use:enhance={() => {
														if (
															!confirm(
																'Are you sure you want to delete this class? This will also delete all associated subjects and notes.'
															)
														) {
															return () => {};
														}
														isLoading = true;
														return async ({ update }) => {
															await update();
															isLoading = false;
														};
													}}
													class="inline"
												>
													<input type="hidden" name="id" value={cls.id} />
													<button
														type="submit"
														disabled={isLoading}
														class="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/30 transition-colors"
														title="Delete"
													>
														<svg
															class="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															aria-hidden="true"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															></path>
														</svg>
													</button>
												</form>
											</div>
										{/if}
									</div>
								{/each}
								{#if data.classes.length === 0}
									<div
										class="text-center py-12 bg-gray-50/30 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300/50 dark:border-gray-600/50 backdrop-blur-sm"
									>
										<p class="text-gray-500 dark:text-gray-400">
											No classes found. Add one above to get started.
										</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- File Types Tab -->
				{#if activeTab === 'fileTypes'}
					<div class="space-y-6">
						<div
							class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-6"
						>
							<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
								Manage File Types
							</h2>

							<!-- Add New File Type Form -->
							<form
								method="POST"
								action="?/createFileType"
								use:enhance={() => {
									isLoading = true;
									return async ({ update }) => {
										await update();
										isLoading = false;
									};
								}}
								class="mb-8 p-6 bg-white/20 border border-gray-200/30 rounded-xl dark:bg-gray-700/20 dark:border-gray-600/30 backdrop-blur-sm"
							>
								<h3
									class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider dark:text-white"
								>
									Add New File Type
								</h3>
								<div class="flex flex-col sm:flex-row gap-4">
									<input
										type="text"
										name="name"
										placeholder="File type name (e.g., PDF, Word Document)"
										required
										class="glass-input flex-1 border border-gray-300/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all dark:border-gray-600/50 text-gray-900 dark:text-white"
									/>
									<button
										type="submit"
										disabled={isLoading}
										class="glass-btn px-6 py-2.5 rounded-lg disabled:opacity-50 transition-colors font-medium shadow-sm"
									>
										{isLoading ? 'Adding...' : 'Add Type'}
									</button>
								</div>
							</form>

							<!-- File Types List -->
							<div class="space-y-3">
								{#each data.fileTypes as fileType}
									<div
										class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 border border-gray-200/30 dark:border-gray-700/30 rounded-xl hover:border-gray-300/50 dark:hover:border-gray-600/50 transition-colors bg-white/20 dark:bg-gray-800/20 gap-4 sm:gap-0 backdrop-blur-sm"
									>
										{#if editingItem?.id === fileType.id}
											<!-- Edit Form -->
											<form
												method="POST"
												action="?/updateFileType"
												use:enhance={() => {
													isLoading = true;
													return async ({ update }) => {
														await update();
														isLoading = false;
														editingItem = null;
													};
												}}
												class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1"
											>
												<input type="hidden" name="id" value={fileType.id} />
												<input
													type="text"
													name="name"
													value={editingItem.name}
													oninput={(e) => {
														const target = e.target as HTMLInputElement;
														if (target) editingItem.name = target.value;
													}}
													class="glass-input flex-1 border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white"
												/>
												<div class="flex gap-2">
													<button
														type="submit"
														disabled={isLoading}
														class="bg-green-600/80 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700/80 disabled:opacity-50 font-medium flex-1 sm:flex-none backdrop-blur-sm"
													>
														Save
													</button>
													<button
														type="button"
														onclick={cancelEdit}
														class="bg-gray-100/50 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200/50 font-medium flex-1 sm:flex-none backdrop-blur-sm"
													>
														Cancel
													</button>
												</div>
											</form>
										{:else}
											<!-- Display Mode -->
											<div class="flex items-center gap-3">
												<div
													class="w-10 h-10 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-brand-purple dark:text-purple-400 font-bold flex-shrink-0 backdrop-blur-sm"
												>
													<svg
														class="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-hidden="true"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
														></path>
													</svg>
												</div>
												<span class="font-medium text-gray-900 dark:text-white"
													>{fileType.name}</span
												>
											</div>
											<div class="flex gap-2 justify-end">
												<button
													onclick={() => startEdit(fileType)}
													class="text-gray-400 hover:text-brand-blue dark:text-gray-500 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors"
													title="Edit"
												>
													<svg
														class="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-hidden="true"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														></path>
													</svg>
												</button>
												<form
													method="POST"
													action="?/deleteFileType"
													use:enhance={() => {
														if (
															!confirm(
																'Are you sure you want to delete this file type? This will also delete all associated notes.'
															)
														) {
															return () => {};
														}
														isLoading = true;
														return async ({ update }) => {
															await update();
															isLoading = false;
														};
													}}
													class="inline"
												>
													<input type="hidden" name="id" value={fileType.id} />
													<button
														type="submit"
														disabled={isLoading}
														class="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/30 transition-colors"
														title="Delete"
													>
														<svg
															class="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															aria-hidden="true"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															></path>
														</svg>
													</button>
												</form>
											</div>
										{/if}
									</div>
								{/each}
								{#if data.fileTypes.length === 0}
									<div
										class="text-center py-12 bg-gray-50/30 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300/50 dark:border-gray-600/50 backdrop-blur-sm"
									>
										<p class="text-gray-500 dark:text-gray-400">
											No file types found. Add one above to get started.
										</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Subjects Tab -->
				{#if activeTab === 'subjects'}
					<div class="space-y-6">
						<div
							class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-6"
						>
							<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
								Manage Subjects by Class
							</h2>

							{#each data.classes as cls}
								{@const classSubjects = subjectsByClass().get(cls.id) || []}
								<div
									class="border border-gray-200/30 dark:border-gray-700/30 rounded-xl mb-4 overflow-hidden"
								>
									<!-- Class Header -->
									<div
										class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/10 dark:bg-gray-700/20 border-b border-gray-200/30 dark:border-gray-700/30 gap-4 sm:gap-0 backdrop-blur-sm"
									>
										<button
											onclick={() => toggleClassExpansion(cls.id)}
											class="flex items-center space-x-3 text-left flex-1 focus:outline-none w-full sm:w-auto"
										>
											<div
												class="w-8 h-8 bg-white/50 dark:bg-gray-800/50 border border-gray-200/30 dark:border-gray-600/30 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0 backdrop-blur-sm"
											>
												<svg
													class={`w-4 h-4 transition-transform duration-200 ${expandedClasses.has(cls.id) ? 'rotate-90' : ''}`}
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 5l7 7-7 7"
													/>
												</svg>
											</div>
											<div>
												<h3 class="text-base font-semibold text-gray-900 dark:text-white">
													{cls.name}
												</h3>
												<p class="text-sm text-gray-500 dark:text-gray-400">
													{classSubjects.length} subjects
												</p>
											</div>
										</button>
										<button
											onclick={() => startAddSubject(cls.id)}
											class="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50/50 dark:hover:bg-gray-700/50 font-medium transition-colors w-full sm:w-auto backdrop-blur-sm"
										>
											Add Subject
										</button>
									</div>

									<!-- Collapsible Content -->
									{#if expandedClasses.has(cls.id)}
										<div class="p-4 bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm">
											<!-- Add Subject Form (when adding to this class) -->
											{#if newSubjectClassId === cls.id && editingItem && !editingItem.id}
												<form
													method="POST"
													action="?/createSubject"
													use:enhance={() => {
														isLoading = true;
														return async ({ update }) => {
															await update();
															isLoading = false;
															newSubjectClassId = null;
															editingItem = null;
														};
													}}
													class="mb-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-xl backdrop-blur-sm"
												>
													<h4 class="text-sm font-semibold text-brand-blue dark:text-blue-400 mb-3">
														Add New Subject to {cls.name}
													</h4>
													<div class="flex flex-col sm:flex-row gap-3">
														<input type="hidden" name="class_id" value={cls.id} />
														<input
															type="text"
															name="name"
															bind:value={editingItem.name}
															placeholder="Subject name"
															required
															class="glass-input flex-1 border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white"
														/>
														<div class="flex gap-2">
															<button
																type="submit"
																disabled={isLoading}
																class="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex-1 sm:flex-none"
															>
																{isLoading ? 'Adding...' : 'Add'}
															</button>
															<button
																type="button"
																onclick={() => {
																	newSubjectClassId = null;
																	editingItem = null;
																}}
																class="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 font-medium flex-1 sm:flex-none backdrop-blur-sm"
															>
																Cancel
															</button>
														</div>
													</div>
												</form>
											{/if}

											<!-- Subjects List -->
											<div class="space-y-2">
												{#each classSubjects as subject}
													<div
														class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 bg-gray-50/30 dark:bg-gray-700/20 rounded-lg border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50 transition-colors gap-3 sm:gap-0 backdrop-blur-sm"
													>
														{#if editingItem && editingItem.id === subject.id}
															<!-- Edit Form -->
															<form
																method="POST"
																action="?/updateSubject"
																use:enhance={() => {
																	isLoading = true;
																	return async ({ update }) => {
																		await update();
																		isLoading = false;
																		editingItem = null;
																	};
																}}
																class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1"
															>
																<input type="hidden" name="id" value={subject.id} />
																<input type="hidden" name="class_id" value={subject.class_id} />
																<input
																	type="text"
																	name="name"
																	bind:value={editingItem.name}
																	required
																	class="glass-input flex-1 border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white"
																/>
																<div class="flex gap-2">
																	<button
																		type="submit"
																		disabled={isLoading}
																		class="bg-green-600/80 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700/80 disabled:opacity-50 font-medium flex-1 sm:flex-none backdrop-blur-sm"
																	>
																		{isLoading ? 'Saving...' : 'Save'}
																	</button>
																	<button
																		type="button"
																		onclick={() => (editingItem = null)}
																		class="bg-gray-200/50 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300/50 dark:hover:bg-gray-500/50 font-medium flex-1 sm:flex-none backdrop-blur-sm"
																	>
																		Cancel
																	</button>
																</div>
															</form>
														{:else}
															<!-- Display Mode -->
															<div class="flex items-center gap-3">
																<div
																	class="w-8 h-8 bg-white/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200/30 dark:border-gray-600/30 flex-shrink-0 backdrop-blur-sm"
																>
																	<svg
																		class="w-4 h-4"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																		aria-hidden="true"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
																		></path>
																	</svg>
																</div>
																<div>
																	<h4 class="font-medium text-gray-900 dark:text-white">
																		{subject.name}
																	</h4>
																	<p class="text-xs text-gray-500 dark:text-gray-400">
																		Created: {new Date(subject.created_at).toLocaleDateString()}
																	</p>
																</div>
															</div>
															<div class="flex gap-2 justify-end">
																<button
																	onclick={() => startEdit(subject)}
																	class="text-gray-400 hover:text-brand-blue dark:text-gray-500 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors"
																	title="Edit"
																>
																	<svg
																		class="w-5 h-5"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																		aria-hidden="true"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																		></path>
																	</svg>
																</button>
																<form
																	method="POST"
																	action="?/deleteSubject"
																	use:enhance={() => {
																		if (
																			!confirm(
																				'Are you sure you want to delete this subject? This will also delete all associated notes.'
																			)
																		) {
																			return () => {};
																		}
																		isLoading = true;
																		return async ({ update }) => {
																			await update();
																			isLoading = false;
																		};
																	}}
																	class="inline"
																>
																	<input type="hidden" name="id" value={subject.id} />
																	<button
																		type="submit"
																		disabled={isLoading}
																		class="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/30 transition-colors"
																		title="Delete"
																	>
																		<svg
																			class="w-5 h-5"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																			aria-hidden="true"
																		>
																			<path
																				stroke-linecap="round"
																				stroke-linejoin="round"
																				stroke-width="2"
																				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																			></path>
																		</svg>
																	</button>
																</form>
															</div>
														{/if}
													</div>
												{/each}
												{#if classSubjects.length === 0}
													<div
														class="text-center py-6 bg-gray-50/30 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-300/50 dark:border-gray-600/50 backdrop-blur-sm"
													>
														<p class="text-gray-500 dark:text-gray-400 text-sm">
															No subjects found for this class.
														</p>
													</div>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							{/each}

							{#if data.classes.length === 0}
								<div
									class="text-center py-12 bg-gray-50/30 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300/50 dark:border-gray-600/50 backdrop-blur-sm"
								>
									<p class="text-gray-500 dark:text-gray-400">
										No classes found. Create a class first to manage subjects.
									</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Admin Account Tab -->
				{#if activeTab === 'admin'}
					<div class="space-y-6">
						<div
							class="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-6"
						>
							<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
								Admin Account Settings
							</h2>

							<form
								method="POST"
								action="?/updateAdmin"
								use:enhance={() => {
									isLoading = true;
									return async ({ update }) => {
										await update();
										isLoading = false;
									};
								}}
								class="space-y-6 max-w-md"
							>
								<div>
									<label
										for="current_password"
										class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Current Password
									</label>
									<input
										type="password"
										id="current_password"
										name="current_password"
										required
										class="glass-input w-full border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white transition-all"
									/>
								</div>

								<div>
									<label
										for="username"
										class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										New Username
									</label>
									<input
										type="text"
										id="username"
										name="username"
										required
										class="glass-input w-full border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white transition-all"
									/>
								</div>

								<div>
									<label
										for="new_password"
										class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										New Password
									</label>
									<input
										type="password"
										id="new_password"
										name="new_password"
										required
										class="glass-input w-full border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-gray-900 dark:text-white transition-all"
									/>
								</div>

								<button
									type="submit"
									disabled={isLoading}
									class="glass-btn px-8 py-2.5 rounded-lg disabled:opacity-50 transition-colors font-medium shadow-sm w-full sm:w-auto"
								>
									{isLoading ? 'Updating...' : 'Update Credentials'}
								</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
