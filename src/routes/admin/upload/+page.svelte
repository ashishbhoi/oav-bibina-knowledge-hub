<script lang="ts">
    import {page} from "$app/stores";
    import {onMount} from "svelte";

    console.log("Upload page script loaded!");
    console.log("Page data:", $page);

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

    let {data, form}: Props = $props();

    let selectedFile: File | null = $state(null);
    let selectedClass = $state(data.preselected.classId || "");
    let selectedSubject = $state(data.preselected.subjectId || "");
    let selectedFileType = $state(data.preselected.fileTypeId || "");
    let displayName = $state("");
    let isUploading = $state(false);
    let uploadProgress = $state(0);
    let uploadError = $state("");
    let uploadSuccess = $state(false);

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

    onMount(() => {
        console.log("Upload page mounted!");
        console.log("Component data:", data);
    });

    async function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            selectedFile = file;
            if (!displayName) {
                displayName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            }
        }
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            selectedFile = files[0];
            if (!displayName) {
                displayName = files[0].name.replace(/\.[^/.]+$/, "");
            }
        }
    }

    async function fetchSubjects(classId: string) {
        console.log("fetchSubjects called with classId:", classId);
        if (!classId || classId === "") {
            console.log("No classId provided, clearing subjects");
            availableSubjects = [];
            return;
        }

        try {
            console.log("Making fetch request for subjects...");
            const response = await fetch("/api/subjects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    class_id: classId,
                }),
            });

            console.log("Subjects fetch response status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: SubjectsResponse = await response.json();
            console.log("Subjects fetch result:", result);

            if (result.subjects) {
                availableSubjects = result.subjects;
                console.log("Updated availableSubjects:", availableSubjects);
            } else {
                console.log("No subjects in result, clearing array");
                availableSubjects = [];
            }
        } catch (error) {
            console.error("Failed to fetch subjects:", error);
            availableSubjects = [];
        }
    }

    async function uploadFile() {
        console.log("uploadFile function called!");
        console.log("selectedFile:", selectedFile);
        console.log("selectedClass:", selectedClass);
        console.log("selectedSubject:", selectedSubject);
        console.log("selectedFileType:", selectedFileType);
        console.log("displayName:", displayName);

        if (
            !selectedFile ||
            !selectedClass ||
            !selectedSubject ||
            !selectedFileType ||
            !displayName.trim()
        ) {
            uploadError = "Please fill in all required fields and select a file";
            console.log("Validation failed:", {
                selectedFile,
                selectedClass,
                selectedSubject,
                selectedFileType,
                displayName,
            });
            return;
        }

        console.log("Starting upload process...");
        isUploading = true;
        uploadError = "";
        uploadProgress = 0;

        try {
            uploadProgress = 10;

            // Step 1: Generate object key
            const uploadUrlResponse = await fetch(
                "/admin/upload?/generateUploadUrl",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        file_name: selectedFile.name,
                        file_size: selectedFile.size.toString(),
                    }),
                }
            );

            if (!uploadUrlResponse.ok) {
                const errorText = await uploadUrlResponse.text();
                console.error("Server response error:", errorText);
                throw new Error(`Server error: ${uploadUrlResponse.status}`);
            }

            const responseText = await uploadUrlResponse.text();
            console.log("Raw response:", responseText);

            let uploadUrlResult: UploadServerResponse;
            try {
                const parsedResponse = JSON.parse(responseText);
                console.log("Parsed response:", parsedResponse);

                // Handle SvelteKit form action response format
                if (parsedResponse.type === "success" && parsedResponse.data) {
                    // Parse the data string which contains the actual response
                    const actionData = JSON.parse(parsedResponse.data);
                    console.log("Action result:", actionData);

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
                        console.log("Reconstructed response:", uploadUrlResult);
                    } else {
                        uploadUrlResult = actionData as UploadServerResponse;
                    }
                } else {
                    uploadUrlResult = parsedResponse as UploadServerResponse;
                }
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Failed to parse server response");
            }

            if (!uploadUrlResult || typeof uploadUrlResult !== "object") {
                throw new Error("Invalid response format");
            }

            if (!uploadUrlResult.success) {
                throw new Error(
                    uploadUrlResult.message || "Upload URL generation failed"
                );
            }

            if (!uploadUrlResult.key) {
                throw new Error("No object key received");
            }

            uploadProgress = 25;

            // Step 2: Upload file via server-side proxy
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile);
            uploadFormData.append("key", uploadUrlResult.key);

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error("Upload error:", errorText);
                throw new Error("Failed to upload file to storage");
            }

            const uploadResult = (await uploadResponse.json()) as ApiUploadResponse;
            if (!uploadResult.success) {
                throw new Error(uploadResult.message || "Upload failed");
            }

            uploadProgress = 75;

            // Step 3: Save file metadata to database
            const metadataResponse = await fetch("/admin/upload?/saveFileMetadata", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
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
                console.error("Metadata response error:", errorText);
                throw new Error(`Server error: ${metadataResponse.status}`);
            }

            const metadataResponseText = await metadataResponse.text();
            console.log("Raw metadata response:", metadataResponseText);

            let metadataResult: UploadServerResponse;
            try {
                const parsedMetadataResponse = JSON.parse(metadataResponseText);
                console.log("Parsed metadata response:", parsedMetadataResponse);

                // Handle SvelteKit form action response format
                if (
                    parsedMetadataResponse.type === "success" &&
                    parsedMetadataResponse.data
                ) {
                    // Parse the data string which contains the actual response
                    const actionData = JSON.parse(parsedMetadataResponse.data);
                    console.log("Metadata action result:", actionData);

                    // SvelteKit serializes the response in a special format
                    if (Array.isArray(actionData) && actionData.length > 0) {
                        const [structure, ...values] = actionData;

                        // Reconstruct the actual object
                        const reconstructed: any = {};
                        for (const [key, index] of Object.entries(structure)) {
                            reconstructed[key] = values[(index as number) - 1]; // indices are 1-based
                        }
                        metadataResult = reconstructed as UploadServerResponse;
                        console.log("Reconstructed metadata response:", metadataResult);
                    } else {
                        metadataResult = actionData as UploadServerResponse;
                    }
                } else {
                    metadataResult = parsedMetadataResponse as UploadServerResponse;
                }
            } catch (parseError) {
                console.error("Metadata JSON parse error:", parseError);
                throw new Error("Failed to parse metadata response");
            }

            if (!metadataResult || typeof metadataResult !== "object") {
                throw new Error("Invalid metadata response format");
            }

            if (!metadataResult.success) {
                throw new Error(
                    metadataResult.message || "Failed to save file information"
                );
            }

            uploadProgress = 100;
            uploadSuccess = true;

            // Reset form
            selectedFile = null;
            displayName = "";
            if (!data.preselected.classId) selectedClass = "";
            if (!data.preselected.subjectId) selectedSubject = "";
            if (!data.preselected.fileTypeId) selectedFileType = "";

            // Clear file input
            const fileInput = document.getElementById(
                "file-input"
            ) as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } catch (error) {
            uploadError = error instanceof Error ? error.message : "Upload failed";
        } finally {
            isUploading = false;
            if (!uploadSuccess) {
                uploadProgress = 0;
            }
        }
    }

    // Fetch subjects when class changes
    $effect(() => {
        console.log("Effect triggered, selectedClass:", selectedClass);
        if (selectedClass && selectedClass !== "") {
            console.log("Fetching subjects for class:", selectedClass);
            // Always fetch subjects when a class is selected, regardless of preselected state
            fetchSubjects(selectedClass);
            selectedSubject = ""; // Reset subject selection
        } else {
            console.log("Clearing subjects, no class selected");
            // Clear subjects when no class is selected
            availableSubjects = [];
            selectedSubject = "";
        }
    });

    // Debug effect to track availableSubjects changes
    $effect(() => {
        console.log("availableSubjects changed:", availableSubjects);
        console.log("Number of subjects:", availableSubjects.length);
    });

    // Debug effect to track selectedClass changes
    $effect(() => {
        console.log("selectedClass value changed to:", selectedClass);
    });

    // Alternative approach: Use a change handler directly on the select element
    function handleClassChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const classId = target.value;
        console.log("Class change handler triggered:", classId);
        // Don't set selectedClass here - let bind:value handle it

        if (classId && classId !== "") {
            console.log("Fetching subjects via change handler for class:", classId);
            fetchSubjects(classId);
            selectedSubject = ""; // Reset subject selection
        } else {
            console.log("Clearing subjects via change handler");
            availableSubjects = [];
            selectedSubject = "";
        }
    }
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <!-- Header -->
    <div class="mb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-900">Upload File</h1>
                <a
                        class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        href="/admin/dashboard"
                >
                    ← Back to Dashboard
                </a>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Success Message -->
        {#if uploadSuccess}
            <div
                    class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
            >
                <strong>Success!</strong> File uploaded successfully!
            </div>
        {/if}

        <!-- Error Message -->
        {#if uploadError}
            <div
                    class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
                <strong>Error:</strong>
                {uploadError}
            </div>
        {/if}

        <!-- Upload Form -->
        <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-6">
                Upload Study Material
            </h2>

            <!-- File Selection -->
            <div class="mb-6">
                <label
                        class="block text-sm font-medium text-gray-700 mb-2"
                        for="file-input"
                >
                    Select File *
                </label>

                <!-- Drag and Drop Area -->
                <div
                        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                        ondragover={handleDragOver}
                        ondrop={handleDrop}
                        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("file-input")?.click();
            }
          }}
                        role="button"
                        tabindex="0"
                >
                    {#if selectedFile}
                        <div class="text-green-600">
                            <svg
                                    class="mx-auto h-12 w-12 mb-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                            >
                                <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p class="text-sm font-medium">{selectedFile.name}</p>
                            <p class="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    {:else}
                        <svg
                                class="mx-auto h-12 w-12 text-gray-400 mb-3"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                        >
                            <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                            />
                        </svg>
                        <p class="text-sm text-gray-600 mb-2">
                            <button
                                    type="button"
                                    onclick={() => document.getElementById("file-input")?.click()}
                                    class="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Click to upload
                            </button>
                            or drag and drop
                        </p>
                        <p class="text-xs text-gray-500">
                            PDF, DOC, PPT, XLS, etc. (max 50MB)
                        </p>
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- Display Name -->
                <div class="md:col-span-2">
                    <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                            for="display_name"
                    >
                        Display Name *
                    </label>
                    <input
                            bind:value={displayName}
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="display_name"
                            placeholder="Enter a display name for this file"
                            required
                            type="text"
                    />
                </div>

                <!-- Class Selection -->
                <div>
                    <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                            for="class_id"
                    >
                        Class *
                    </label>
                    <select
                            bind:value={selectedClass}
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="class_id"
                            onchange={handleClassChange}
                            required
                    >
                        <option value="">Select Class</option>
                        {#each data.classes as cls}
                            <option value={cls.id.toString()}>{cls.name}</option>
                        {/each}
                    </select>
                </div>

                <!-- Subject Selection -->
                <div>
                    <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                            for="subject_id"
                    >
                        Subject *
                    </label>
                    <select
                            bind:value={selectedSubject}
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={!selectedClass || availableSubjects.length === 0}
                            id="subject_id"
                            required
                    >
                        <option value="">Select Subject</option>
                        {#each availableSubjects as subject}
                            <option value={subject.id.toString()}>{subject.name}</option>
                        {/each}
                    </select>
                    {#if selectedClass && availableSubjects.length === 0}
                        <p class="text-xs text-gray-500 mt-1">
                            No subjects found for selected class
                        </p>
                    {/if}
                </div>

                <!-- File Type Selection -->
                <div>
                    <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                            for="file_type_id"
                    >
                        File Type *
                    </label>
                    <select
                            bind:value={selectedFileType}
                            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="file_type_id"
                            required
                    >
                        <option value="">Select File Type</option>
                        {#each data.fileTypes as fileType}
                            <option value={fileType.id.toString()}>{fileType.name}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Upload Progress -->
            {#if isUploading}
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700">Uploading...</span>
                        <span class="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style="width: {uploadProgress}%"
                        ></div>
                    </div>
                </div>
            {/if}

            <!-- Upload Button -->
            <div class="flex justify-end gap-2">
                <button
                        class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        onclick={() => console.log("Test button clicked!")}
                        type="button"
                >
                    Test Console
                </button>
                <button
                        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        Uploading...
                    {:else}
                        Upload File
                    {/if}
                </button>
            </div>
        </div>
    </main>
</div>
