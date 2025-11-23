<script lang="ts">
	interface Props {
		data: {
			classes: Array<{
				id: number;
				name: string;
			}>;
			fileTypes: Array<{
				id: number;
				name: string;
			}>;
			preselected: {
				classId: string | null;
				subjectId: string | null;
				fileTypeId: string | null;
			};
			preselectedSubjects: Array<{
				id: number;
				name: string;
			}>;
		};
		form?: any;
	}

	let { data, form }: Props = $props();

	let selectedFile: File | null = $state(null);
	let selectedClass = $state(data.preselected.classId || '');
	let selectedSubject = $state(data.preselected.subjectId || '');
	let selectedFileType = $state(data.preselected.fileTypeId || '');
	let displayName = $state('');
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let uploadError = $state('');
	let uploadSuccess = $state(false);
	let isDragging = $state(false);

	// Available subjects for selected class
	let availableSubjects = $state<Array<{ id: number; name: string }>>(
		data.preselectedSubjects || []
	);

	interface UploadUrlResponse {
		success: boolean;
		uploadUrl?: string;
		objectKey?: string;
		message?: string;
	}

	interface MetadataResponse {
		success: boolean;
		message?: string;
	}

	interface SubjectsResponse {
		subjects?: Array<{ id: number; name: string }>;
	}

	interface UploadServerResponse {
		success: boolean;
		message?: string;
		key?: string;
	}

	interface ApiUploadResponse {
		success: boolean;
		message?: string;
	}

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			selectedFile = file;
			if (!displayName) {
				displayName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
			}
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			selectedFile = files[0];
			if (!displayName) {
				displayName = files[0].name.replace(/\.[^/.]+$/, '');
			}
		}
	}

	async function fetchSubjects(classId: string) {
		if (!classId || classId === '') {
			availableSubjects = [];
			return;
		}

		try {
			const response = await fetch('/api/subjects', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					class_id: classId,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: SubjectsResponse = await response.json();

			if (result.subjects) {
				availableSubjects = result.subjects;
			} else {
				availableSubjects = [];
			}
		} catch (error) {
			console.error('Failed to fetch subjects:', error);
			availableSubjects = [];
		}
	}

	async function uploadFile() {
		if (
			!selectedFile ||
			!selectedClass ||
			!selectedSubject ||
			!selectedFileType ||
			!displayName.trim()
		) {
			uploadError = 'Please fill in all required fields and select a file';
			return;
		}
		isUploading = true;
		uploadError = '';
		uploadProgress = 0;

		try {
			uploadProgress = 10;

			// Step 1: Generate object key
			const uploadUrlResponse = await fetch('/admin/upload?/generateUploadUrl', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					file_name: selectedFile.name,
					file_size: selectedFile.size.toString(),
				}),
			});

			if (!uploadUrlResponse.ok) {
				const errorText = await uploadUrlResponse.text();
				console.error('Server response error:', errorText);
				throw new Error(`Server error: ${uploadUrlResponse.status}`);
			}

			const responseText = await uploadUrlResponse.text();

			let uploadUrlResult: UploadServerResponse;
			try {
				const parsedResponse = JSON.parse(responseText);

				// Handle SvelteKit form action response format
				if (parsedResponse.type === 'success' && parsedResponse.data) {
					// Parse the data string which contains the actual response
					const actionData = JSON.parse(parsedResponse.data);

					// SvelteKit serializes the response in a special format
					// The first element is the object structure, subsequent elements are values
					if (Array.isArray(actionData) && actionData.length > 0) {
						const [structure, ...values] = actionData;

						// Reconstruct the actual object
						const reconstructed: any = {};
						for (const [key, index] of Object.entries(structure)) {
							reconstructed[key] = values[(index as number) - 1]; // indices are 1-based
						}
						uploadUrlResult = reconstructed as UploadServerResponse;
					} else {
						uploadUrlResult = actionData as UploadServerResponse;
					}
				} else {
					uploadUrlResult = parsedResponse as UploadServerResponse;
				}
			} catch (parseError) {
				console.error('JSON parse error:', parseError);
				throw new Error('Failed to parse server response');
			}

			if (!uploadUrlResult || typeof uploadUrlResult !== 'object') {
				throw new Error('Invalid response format');
			}

			if (!uploadUrlResult.success) {
				throw new Error(uploadUrlResult.message || 'Upload URL generation failed');
			}

			if (!uploadUrlResult.key) {
				throw new Error('No object key received');
			}

			uploadProgress = 25;

			// Step 2: Upload file via server-side proxy
			const uploadFormData = new FormData();
			uploadFormData.append('file', selectedFile);
			uploadFormData.append('key', uploadUrlResult.key);

			const uploadResponse = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData,
			});

			if (!uploadResponse.ok) {
				const errorText = await uploadResponse.text();
				console.error('Upload error:', errorText);
				throw new Error('Failed to upload file to storage');
			}

			const uploadResult = (await uploadResponse.json()) as ApiUploadResponse;
			if (!uploadResult.success) {
				throw new Error(uploadResult.message || 'Upload failed');
			}

			uploadProgress = 75;

			// Step 3: Save file metadata to database
			const metadataResponse = await fetch('/admin/upload?/saveFileMetadata', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					display_name: displayName.trim(),
					class_id: selectedClass,
					subject_id: selectedSubject,
					file_type_id: selectedFileType,
					file_name: selectedFile.name,
					file_size: selectedFile.size.toString(),
					object_key: uploadUrlResult.key,
				}),
			});

			if (!metadataResponse.ok) {
				const errorText = await metadataResponse.text();
				console.error('Metadata response error:', errorText);
				throw new Error(`Server error: ${metadataResponse.status}`);
			}

			const metadataResponseText = await metadataResponse.text();

			let metadataResult: UploadServerResponse;
			try {
				const parsedMetadataResponse = JSON.parse(metadataResponseText);

				// Handle SvelteKit form action response format
				if (parsedMetadataResponse.type === 'success' && parsedMetadataResponse.data) {
					// Parse the data string which contains the actual response
					const actionData = JSON.parse(parsedMetadataResponse.data);

					// SvelteKit serializes the response in a special format
					if (Array.isArray(actionData) && actionData.length > 0) {
						const [structure, ...values] = actionData;

						// Reconstruct the actual object
						const reconstructed: any = {};
						for (const [key, index] of Object.entries(structure)) {
							reconstructed[key] = values[(index as number) - 1]; // indices are 1-based
						}
						metadataResult = reconstructed as UploadServerResponse;
					} else {
						metadataResult = actionData as UploadServerResponse;
					}
				} else {
					metadataResult = parsedMetadataResponse as UploadServerResponse;
				}
			} catch (parseError) {
				console.error('Metadata JSON parse error:', parseError);
				throw new Error('Failed to parse metadata response');
			}

			if (!metadataResult || typeof metadataResult !== 'object') {
				throw new Error('Invalid metadata response format');
			}

			if (!metadataResult.success) {
				throw new Error(metadataResult.message || 'Failed to save file information');
			}

			uploadProgress = 100;
			uploadSuccess = true;

			// Reset form
			selectedFile = null;
			displayName = '';
			if (!data.preselected.classId) selectedClass = '';
			if (!data.preselected.subjectId) selectedSubject = '';
			if (!data.preselected.fileTypeId) selectedFileType = '';

			// Clear file input
			const fileInput = document.getElementById('file-input') as HTMLInputElement;
			if (fileInput) fileInput.value = '';
		} catch (error) {
			uploadError = error instanceof Error ? error.message : 'Upload failed';
		} finally {
			isUploading = false;
			if (!uploadSuccess) {
				uploadProgress = 0;
			}
		}
	}

	// Fetch subjects when class changes
	$effect(() => {
		if (selectedClass && selectedClass !== '') {
			// Always fetch subjects when a class is selected, regardless of preselected state
			fetchSubjects(selectedClass);
			selectedSubject = ''; // Reset subject selection
		} else {
			// Clear subjects when no class is selected
			availableSubjects = [];
			selectedSubject = '';
		}
	});

	// Alternative approach: Use a change handler directly on the select element
	function handleClassChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const classId = target.value;
		// Don't set selectedClass here - let bind:value handle it

		if (classId && classId !== '') {
			fetchSubjects(classId);
			selectedSubject = ''; // Reset subject selection
		} else {
			availableSubjects = [];
			selectedSubject = '';
		}
	}
</script>

<svelte:head>
	<title>Upload File | Admin | OAV Bibina Knowledge Hub</title>
	<meta
		name="description"
		content="Upload new academic files and study materials to the knowledge hub."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen py-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div
				class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0"
			>
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Upload File</h1>
					<p class="mt-2 text-gray-600 dark:text-gray-400">
						Add new study materials to the knowledge hub
					</p>
				</div>
				<a class="glass-btn-secondary inline-flex items-center" href="/admin/dashboard">
					← Back to Dashboard
				</a>
			</div>
		</div>
	</div>

	<!-- Upload Card -->
	<div class="glass-card">
		<form
			class="p-6 md:p-8"
			onsubmit={(e) => {
				e.preventDefault();
				uploadFile();
			}}
		>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">File Details</h2>

			<!-- File Selection -->
			<div class="mb-8">
				<label
					class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
					for="file-input"
				>
					Upload Document *
				</label>

				<!-- Drag and Drop Area -->
				<div
					class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 {isDragging
						? 'border-brand-blue bg-blue-50/50 dark:bg-blue-900/10'
						: 'border-gray-300/50 dark:border-gray-600/50 hover:border-gray-400/70 dark:hover:border-gray-500 hover:bg-white/10 dark:hover:bg-white/5'}"
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					ondrop={handleDrop}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							document.getElementById('file-input')?.click();
						}
					}}
					role="button"
					tabindex="0"
				>
					{#if selectedFile}
						<div class="text-gray-900 dark:text-white">
							<div
								class="w-16 h-16 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
							>
								<svg
									class="w-8 h-8 text-brand-blue"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									></path>
								</svg>
							</div>
							<p class="text-lg font-medium mb-1">{selectedFile.name}</p>
							<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
								{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
							</p>
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									selectedFile = null;
									displayName = '';
								}}
								class="text-red-600 hover:text-red-700 text-sm font-medium"
							>
								Remove File
							</button>
						</div>
					{:else}
						<div class="pointer-events-none">
							<div
								class="w-16 h-16 bg-gray-100/50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
							>
								<svg
									class="w-8 h-8 text-gray-400 dark:text-gray-300"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									></path>
								</svg>
							</div>
							<p class="text-lg font-medium text-gray-900 dark:text-white mb-1">
								<button
									type="button"
									onclick={() => document.getElementById('file-input')?.click()}
									class="text-brand-blue hover:text-blue-700 font-semibold pointer-events-auto"
								>
									Click to upload
								</button>
								or drag and drop
							</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								PDF, DOC, PPT, XLS, Images (max 50MB)
							</p>
						</div>
					{/if}
				</div>

				<input
					accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
					class="hidden"
					id="file-input"
					onchange={handleFileSelect}
					type="file"
				/>
			</div>

			<!-- Form Fields -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				<!-- Display Name -->
				<div class="md:col-span-2">
					<label
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						for="display_name"
					>
						Display Name *
					</label>
					<input
						bind:value={displayName}
						class="glass-input w-full border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-gray-900 dark:text-white"
						id="display_name"
						placeholder="e.g., Chapter 1: Introduction to Science"
						required
						type="text"
					/>
				</div>

				<!-- Class Selection -->
				<div>
					<label
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						for="class_id"
					>
						Class *
					</label>
					<div class="relative">
						<select
							bind:value={selectedClass}
							class="glass-input w-full border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue appearance-none text-gray-900 dark:text-white transition-all"
							id="class_id"
							onchange={handleClassChange}
							required
						>
							<option value="" class="bg-white dark:bg-gray-800">Select Class</option>
							{#each data.classes as cls}
								<option value={cls.id.toString()} class="bg-white dark:bg-gray-800"
									>{cls.name}</option
								>
							{/each}
						</select>
						<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
							<svg
								class="w-5 h-5 text-gray-400 dark:text-gray-300"
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
					</div>
				</div>

				<!-- Subject Selection -->
				<div>
					<label
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						for="subject_id"
					>
						Subject *
					</label>
					<div class="relative">
						<select
							bind:value={selectedSubject}
							class="glass-input w-full border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue disabled:opacity-50 disabled:bg-gray-50/50 dark:disabled:bg-gray-700/50 appearance-none text-gray-900 dark:text-white"
							disabled={!selectedClass || availableSubjects.length === 0}
							id="subject_id"
							required
						>
							<option value="" class="bg-white dark:bg-gray-800">Select Subject</option>
							{#each availableSubjects as subject}
								<option value={subject.id.toString()} class="bg-white dark:bg-gray-800"
									>{subject.name}</option
								>
							{/each}
						</select>
						<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
							<svg
								class="w-5 h-5 text-gray-400 dark:text-gray-300"
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
					</div>
					{#if selectedClass && availableSubjects.length === 0}
						<p class="text-xs text-red-500 mt-1">No subjects found for this class.</p>
					{/if}
				</div>

				<!-- File Type Selection -->
				<div class="md:col-span-2">
					<label
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						for="file_type_id"
					>
						File Type *
					</label>
					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
						{#each data.fileTypes as fileType}
							<label class="cursor-pointer">
								<input
									type="radio"
									name="file_type"
									value={fileType.id.toString()}
									bind:group={selectedFileType}
									class="peer sr-only"
								/>
								<div
									class="border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3 text-center hover:bg-white/10 dark:hover:bg-white/5 peer-checked:border-brand-blue peer-checked:bg-blue-50/50 dark:peer-checked:bg-blue-900/20 peer-checked:text-brand-blue transition-all text-gray-900 dark:text-white backdrop-blur-sm"
								>
									<span class="text-sm font-medium">{fileType.name}</span>
								</div>
							</label>
						{/each}
					</div>
				</div>
			</div>

			<!-- Upload Progress -->
			{#if isUploading}
				<div class="mb-8">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</span>
						<span class="text-sm text-gray-500 dark:text-gray-400">{uploadProgress}%</span>
					</div>
					<div
						class="w-full bg-gray-100/50 dark:bg-gray-700/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm"
					>
						<div
							class="bg-brand-blue h-2.5 rounded-full transition-all duration-300 ease-out"
							style="width: {uploadProgress}%"
						></div>
					</div>
				</div>
			{/if}

			<!-- Upload Button -->
			<div class="flex justify-end pt-6 border-t border-gray-100/30 dark:border-gray-700/30">
				<button
					class="glass-btn px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow font-medium flex items-center"
					disabled={isUploading ||
						!selectedFile ||
						!selectedClass ||
						!selectedSubject ||
						!selectedFileType ||
						!displayName.trim()}
					onclick={uploadFile}
					type="button"
				>
					{#if isUploading}
						<svg
							class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
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
						Upload File
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
