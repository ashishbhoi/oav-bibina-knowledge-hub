<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	interface Props {
		data: {
			notes: any[];
			classes: any[];
			subjects: any[];
			fileTypes: any[];
		};
	}

	let { data }: Props = $props();

	let editingFile: any = $state(null);
	let showDeleteModal = $state(false);
	let fileToDelete: any = $state(null);
	let editForm: HTMLFormElement | undefined = $state();
	let replacementFile: File | null = $state(null);
	let uploadProgress = $state(0);
	let isUploading = $state(false);

	// State for collapsible sections
	let expandedClasses = $state(new Set<number>());
	let expandedSubjects = $state(new Set<string>());

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

	// Helper function to get file icon based on file type
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
		} else if (type.includes('image')) {
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

	function toggleClass(classId: number) {
		if (expandedClasses.has(classId)) {
			expandedClasses.delete(classId);
		} else {
			expandedClasses.add(classId);
		}
		expandedClasses = new Set(expandedClasses);
	}

	function toggleSubject(classId: number, subjectId: number) {
		const key = `${classId}-${subjectId}`;
		if (expandedSubjects.has(key)) {
			expandedSubjects.delete(key);
		} else {
			expandedSubjects.add(key);
		}
		expandedSubjects = new Set(expandedSubjects);
	}

	function startEdit(file: any) {
		editingFile = { ...file };
		replacementFile = null;
		uploadProgress = 0;
		isUploading = false;
	}

	function cancelEdit() {
		editingFile = null;
		replacementFile = null;
		uploadProgress = 0;
		isUploading = false;
	}

	function confirmDelete(file: any) {
		fileToDelete = file;
		showDeleteModal = true;
	}

	function cancelDelete() {
		fileToDelete = null;
		showDeleteModal = false;
	}

	function handleDeleteSuccess() {
		fileToDelete = null;
		showDeleteModal = false;
		invalidateAll();
	}

	async function handleDeleteSubmit(event: Event) {
		event.preventDefault();

		if (!fileToDelete) return;

		try {
			const formData = new FormData();
			formData.append('id', fileToDelete.id.toString());

			const response = await fetch('?/deleteNote', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				handleDeleteSuccess();
			} else {
				alert('Failed to delete file');
			}
		} catch (error) {
			console.error('Delete error:', error);
			alert('Failed to delete file');
		}
	}

	function handleEditSuccess() {
		editingFile = null;
		replacementFile = null;
		uploadProgress = 0;
		isUploading = false;
		invalidateAll();
	}

	async function handleFormSubmit(event: Event) {
		event.preventDefault();

		if (!editForm) return;

		const formData = new FormData(editForm);

		try {
			// If there's a replacement file, upload it first
			if (replacementFile) {
				await handleEditWithFileReplacement(formData);
			}

			// Submit the form data
			const response = await fetch('?/updateNote', {
				method: 'POST',
				body: formData,
			});

			const result: any = await response.json();

			if (result.type === 'success' || response.ok) {
				handleEditSuccess();
			} else {
				isUploading = false;
				alert('Failed to update file: ' + (result.data?.error || 'Unknown error'));
			}
		} catch (error) {
			isUploading = false;
			console.error('Form submission error:', error);
			alert('Failed to update file');
		}
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			replacementFile = input.files[0];
		}
	}

	async function handleEditWithFileReplacement(formData: FormData) {
		if (!replacementFile) {
			// No file replacement, just update metadata
			return;
		}

		isUploading = true;
		uploadProgress = 0;

		try {
			// Step 1: Get pre-signed URL for new file upload
			const uploadResponse = await fetch('/api/upload-url', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					fileName: replacementFile.name,
				}),
			});

			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json().catch(() => ({}));
				console.error('Upload URL error:', errorData);
				throw new Error('Failed to get upload URL');
			}

			const result: any = await uploadResponse.json();

			// Check if the response has the expected structure
			if (!result.uploadUrl || !result.objectKey) {
				console.error('Invalid response:', result);
				throw new Error('Invalid response from server');
			}

			const { uploadUrl, objectKey } = result;

			// Step 2: Upload file to R2 with progress tracking
			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();

				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						uploadProgress = Math.round((e.loaded / e.total) * 100);
					}
				});

				xhr.addEventListener('load', () => {
					if (xhr.status === 200) {
						resolve();
					} else {
						reject(new Error('Upload failed'));
					}
				});

				xhr.addEventListener('error', () => reject(new Error('Upload failed')));

				xhr.open('PUT', uploadUrl);
				xhr.setRequestHeader('Content-Type', replacementFile!.type);
				xhr.send(replacementFile);
			});

			// Step 3: Add the new object key to form data
			formData.append('newR2ObjectKey', objectKey);
			formData.append('hasReplacement', 'true');
		} catch (error) {
			console.error('File upload failed:', error);
			alert('Failed to upload replacement file');
			isUploading = false;
			throw error;
		}

		// Don't set isUploading to false here - let the form submission complete
	}

	// Group files by class and subject
	const groupedFiles = $derived(
		data.classes
			.map((cls) => {
				const classSubjects = data.subjects.filter((s) => s.class_id === cls.id);
				const subjectsWithFiles = classSubjects
					.map((subject) => {
						const subjectFiles = data.notes.filter(
							(note) => note.class_id === cls.id && note.subject_id === subject.id
						);
						return {
							...subject,
							files: subjectFiles,
						};
					})
					.filter((subject) => subject.files.length > 0);

				return {
					...cls,
					subjects: subjectsWithFiles,
					totalFiles: subjectsWithFiles.reduce((total, subject) => total + subject.files.length, 0),
				};
			})
			.filter((cls) => cls.totalFiles > 0)
	);
</script>

<svelte:head>
	<title>File Management | Admin | OAV Bibina Knowledge Hub</title>
	<meta
		name="description"
		content="Manage, edit, and organize academic files and study materials."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<div
				class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0"
			>
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">File Management</h1>
					<p class="mt-2 text-gray-600 dark:text-gray-400">
						Organize, edit, and manage all uploaded study materials
					</p>
				</div>
				<div class="flex gap-3">
					<a class="glass-btn-secondary inline-flex items-center" href="/admin/dashboard">
						← Back
					</a>
					<a class="glass-btn inline-flex items-center" href="/admin/upload">
						<svg
							class="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							></path>
						</svg>
						Upload New File
					</a>
				</div>
			</div>
		</div>

		<!-- File Browser -->
		<div class="glass rounded-2xl overflow-hidden">
			<div class="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Browse Files</h2>
			</div>

			{#if groupedFiles.length > 0}
				<div class="divide-y divide-gray-100/30 dark:divide-gray-700/30">
					{#each groupedFiles as cls}
						<!-- Class Header -->
						<div class="bg-transparent transition-colors hover:bg-white/5">
							<button
								type="button"
								onclick={() => toggleClass(cls.id)}
								class="flex items-center justify-between w-full text-left px-4 sm:px-6 py-4 focus:outline-none"
							>
								<div class="flex items-center min-w-0">
									<div
										class="w-8 h-8 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3 text-brand-blue dark:text-blue-400 flex-shrink-0 backdrop-blur-sm"
									>
										<svg
											class="w-5 h-5 transform transition-transform duration-200 {expandedClasses.has(
												cls.id
											)
												? 'rotate-90'
												: ''}"
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
									<span class="text-lg font-semibold text-gray-900 dark:text-white truncate"
										>{cls.name}</span
									>
									<span
										class="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 flex-shrink-0 backdrop-blur-sm"
									>
										{cls.totalFiles} files
									</span>
								</div>
							</button>

							{#if expandedClasses.has(cls.id)}
								<div
									class="border-t border-gray-100/30 dark:border-gray-700/30 bg-black/5 dark:bg-black/20"
								>
									{#each cls.subjects as subject}
										<!-- Subject Header -->
										<div class="border-b border-gray-100/30 dark:border-gray-700/30 last:border-0">
											<button
												type="button"
												onclick={() => toggleSubject(cls.id, subject.id)}
												class="flex items-center justify-between w-full text-left px-4 sm:px-6 py-3 hover:bg-white/5 transition-colors focus:outline-none pl-12 sm:pl-16"
											>
												<div class="flex items-center">
													<svg
														class="w-4 h-4 text-gray-400 mr-2 transform transition-transform duration-200 {expandedSubjects.has(
															`${cls.id}-${subject.id}`
														)
															? 'rotate-90'
															: ''}"
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
													<span class="text-md font-medium text-gray-800 dark:text-gray-200"
														>{subject.name}</span
													>
													<span class="ml-2 text-sm text-gray-500 dark:text-gray-400"
														>({subject.files.length})</span
													>
												</div>
											</button>

											{#if expandedSubjects.has(`${cls.id}-${subject.id}`)}
												<div class="px-4 sm:px-6 pb-4 pl-4 sm:pl-16 overflow-x-auto">
													<!-- Files Table -->
													<div
														class="overflow-hidden shadow ring-1 ring-black/5 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-md min-w-[600px]"
													>
														<table
															class="min-w-full divide-y divide-gray-200/30 dark:divide-gray-700/30"
														>
															<thead class="bg-gray-50/50 dark:bg-gray-700/50">
																<tr>
																	<th
																		scope="col"
																		class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
																		>File Name</th
																	>
																	<th
																		scope="col"
																		class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
																		>Type</th
																	>
																	<th
																		scope="col"
																		class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
																		>Uploaded</th
																	>
																	<th scope="col" class="relative px-6 py-3"
																		><span class="sr-only">Actions</span></th
																	>
																</tr>
															</thead>
															<tbody
																class="bg-transparent divide-y divide-gray-200/30 dark:divide-gray-700/30"
															>
																{#each subject.files as file}
																	{@const icon = getFileIcon(file.file_type_name)}
																	<tr
																		class="hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
																	>
																		<td class="px-6 py-4 whitespace-nowrap">
																			<div class="flex items-center">
																				<div
																					class="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center shadow-sm {icon.bg}"
																				>
																					<svg
																						class="h-5 w-5 {icon.color}"
																						fill="none"
																						viewBox={icon.viewBox}
																						xmlns="http://www.w3.org/2000/svg"
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
																				<div class="ml-4">
																					<div
																						class="text-sm font-medium text-gray-900 dark:text-white"
																					>
																						{file.display_name}
																					</div>
																					<div class="text-xs text-gray-500 dark:text-gray-400">
																						ID: {file.id}
																					</div>
																				</div>
																			</div>
																		</td>
																		<td class="px-6 py-4 whitespace-nowrap">
																			<span
																				class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100/50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 backdrop-blur-sm"
																			>
																				{file.file_type_name}
																			</span>
																		</td>
																		<td
																			class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
																		>
																			{new Date(file.uploaded_at).toLocaleDateString()}
																		</td>
																		<td
																			class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
																		>
																			<div class="flex items-center justify-end space-x-3">
																				<a
																					href="/download/{file.id}"
																					class="text-brand-blue hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
																					title="Download"
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
																							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
																						></path>
																					</svg>
																				</a>
																				<button
																					onclick={() => startEdit(file)}
																					class="text-gray-400 hover:text-brand-purple dark:text-gray-500 dark:hover:text-brand-purple"
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
																				<button
																					onclick={() => confirmDelete(file)}
																					class="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
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
																			</div>
																		</td>
																	</tr>
																{/each}
															</tbody>
														</table>
													</div>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="px-6 py-12 text-center">
					<div
						class="w-16 h-16 bg-gray-50/50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
					>
						<svg
							class="w-8 h-8 text-gray-400 dark:text-gray-500"
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
					<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Files Uploaded</h3>
					<p class="text-gray-500 dark:text-gray-400 mb-4">
						Get started by uploading your first file.
					</p>
					<a
						href="/admin/upload"
						class="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
					>
						Upload First File
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Edit Modal -->
{#if editingFile}
	<div
		class="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50"
	>
		<div
			class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
		>
			<div class="mt-3">
				<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit File</h3>

				<form bind:this={editForm} method="POST" action="?/updateNote" onsubmit={handleFormSubmit}>
					<input type="hidden" name="id" value={editingFile.id} />

					<div class="mb-4">
						<label
							for="displayName"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							File Name
						</label>
						<input
							type="text"
							name="displayName"
							id="displayName"
							bind:value={editingFile.display_name}
							required
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						/>
					</div>

					<div class="mb-4">
						<label
							for="classId"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Class
						</label>
						<select
							name="classId"
							id="classId"
							bind:value={editingFile.class_id}
							required
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="">Select a class</option>
							{#each data.classes as classItem}
								<option value={classItem.id}>{classItem.name}</option>
							{/each}
						</select>
					</div>

					<div class="mb-4">
						<label
							for="subjectId"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Subject
						</label>
						<select
							name="subjectId"
							id="subjectId"
							bind:value={editingFile.subject_id}
							required
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="">Select a subject</option>
							{#each data.subjects.filter((s) => s.class_id === editingFile.class_id) as subject}
								<option value={subject.id}>{subject.name}</option>
							{/each}
						</select>
					</div>

					<div class="mb-6">
						<label
							for="fileTypeId"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							File Type
						</label>
						<select
							name="fileTypeId"
							id="fileTypeId"
							bind:value={editingFile.file_type_id}
							required
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="">Select a file type</option>
							{#each data.fileTypes as fileType}
								<option value={fileType.id}>{fileType.name}</option>
							{/each}
						</select>
					</div>

					<!-- File Replacement Section -->
					<div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
						<label
							for="replacementFile"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Replace File (Optional)
						</label>
						<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
							Upload a new file to replace the existing one. Leave empty to keep the current file.
						</p>
						<input
							type="file"
							id="replacementFile"
							onchange={handleFileSelect}
							disabled={isUploading}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 dark:hover:file:bg-blue-900/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						/>
						{#if replacementFile}
							<p class="mt-2 text-sm text-green-600">
								Selected: {replacementFile.name} ({(replacementFile.size / 1024 / 1024).toFixed(2)} MB)
							</p>
						{/if}
						{#if isUploading}
							<div class="mt-3">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm text-gray-700 dark:text-gray-300">Uploading...</span>
									<span class="text-sm text-gray-700 dark:text-gray-300">{uploadProgress}%</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										class="bg-blue-600 h-2 rounded-full transition-all duration-300"
										style="width: {uploadProgress}%"
									></div>
								</div>
							</div>
						{/if}
					</div>

					<div class="flex items-center justify-end space-x-3">
						<button
							type="button"
							onclick={cancelEdit}
							disabled={isUploading}
							class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isUploading}
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
						>
							{#if isUploading}
								<svg
									class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Uploading...
							{:else}
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && fileToDelete}
	<div
		class="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50"
	>
		<div
			class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
		>
			<div class="mt-3 text-center">
				<div
					class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
				>
					<svg
						class="h-6 w-6 text-red-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
						></path>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete File</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
					Are you sure you want to delete "<strong>{fileToDelete.display_name}</strong>"? This
					action cannot be undone and will permanently remove the file from storage.
				</p>

				<form method="POST" action="?/deleteNote" onsubmit={handleDeleteSubmit}>
					<input type="hidden" name="id" value={fileToDelete.id} />

					<div class="flex items-center justify-center space-x-3">
						<button
							type="button"
							onclick={cancelDelete}
							class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
						>
							Delete File
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
