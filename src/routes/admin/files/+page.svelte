<script lang="ts">
    import {enhance} from "$app/forms";
    import {invalidateAll} from "$app/navigation";

    interface Props {
        data: {
            notes: any[];
            classes: any[];
            subjects: any[];
            fileTypes: any[];
        };
    }

    let {data}: Props = $props();

    let editingFile: any = $state(null);
    let showDeleteModal = $state(false);
    let fileToDelete: any = $state(null);
    let editForm: HTMLFormElement | undefined = $state();

    // State for collapsible sections
    let expandedClasses = $state(new Set<number>());
    let expandedSubjects = $state(new Set<string>());

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
        editingFile = {...file};
    }

    function cancelEdit() {
        editingFile = null;
    }

    function confirmDelete(file: any) {
        fileToDelete = file;
        showDeleteModal = true;
    }

    function cancelDelete() {
        fileToDelete = null;
        showDeleteModal = false;
    }

    function handleEditSuccess() {
        editingFile = null;
        invalidateAll();
    }

    function handleDeleteSuccess() {
        fileToDelete = null;
        showDeleteModal = false;
        invalidateAll();
    }

    // Group files by class and subject
    const groupedFiles = $derived(
        data.classes
            .map((cls) => {
                const classSubjects = data.subjects.filter(
                    (s) => s.class_id === cls.id
                );
                const subjectsWithFiles = classSubjects
                    .map((subject) => {
                        const subjectFiles = data.notes.filter(
                            (note) =>
                                note.class_id === cls.id && note.subject_id === subject.id
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
                    totalFiles: subjectsWithFiles.reduce(
                        (total, subject) => total + subject.files.length,
                        0
                    ),
                };
            })
            .filter((cls) => cls.totalFiles > 0)
    );
</script>

<svelte:head>
    <title>File Management - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">File Management</h1>
                    <p class="mt-2 text-gray-600">
                        Manage uploaded files and their properties
                    </p>
                </div>
                <a
                        class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        href="/admin/dashboard"
                >
                    ← Back to Dashboard
                </a>
            </div>
        </div>

        <!-- Files Organization -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-semibold text-gray-900">
                        All Files ({data.notes.length})
                    </h2>
                    <a
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            href="/admin/upload"
                    >
                        Upload New File
                    </a>
                </div>
            </div>

            {#if groupedFiles.length > 0}
                <div class="divide-y divide-gray-200">
                    {#each groupedFiles as cls}
                        <!-- Class Header -->
                        <div class="px-6 py-4">
                            <button
                                    type="button"
                                    onclick={() => toggleClass(cls.id)}
                                    class="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-md p-2 hover:bg-gray-50"
                            >
                                <div class="flex items-center">
                                    <svg
                                            class="w-5 h-5 text-gray-400 mr-2 transform transition-transform duration-200 {expandedClasses.has(
                      cls.id
                    )
                      ? 'rotate-90'
                      : ''}"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                    >
                                        <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                    <span class="text-lg font-semibold text-gray-900"
                                    >{cls.name}</span
                                    >
                                    <span class="ml-2 text-sm text-gray-500"
                                    >({cls.totalFiles} files)</span
                                    >
                                </div>
                            </button>

                            {#if expandedClasses.has(cls.id)}
                                <div class="mt-4 ml-7">
                                    {#each cls.subjects as subject}
                                        <!-- Subject Header -->
                                        <div class="mb-4">
                                            <button
                                                    type="button"
                                                    onclick={() => toggleSubject(cls.id, subject.id)}
                                                    class="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-md p-2 hover:bg-gray-50"
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
                                                    >
                                                        <path
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                    <span class="text-md font-medium text-gray-800"
                                                    >{subject.name}</span
                                                    >
                                                    <span class="ml-2 text-sm text-gray-500"
                                                    >({subject.files.length} files)</span
                                                    >
                                                </div>
                                            </button>

                                            {#if expandedSubjects.has(`${cls.id}-${subject.id}`)}
                                                <div class="mt-3 ml-6">
                                                    <!-- Files Table -->
                                                    <div
                                                            class="overflow-x-auto rounded-lg border border-gray-200"
                                                    >
                                                        <table class="min-w-full divide-y divide-gray-200">
                                                            <thead class="bg-gray-50">
                                                            <tr>
                                                                <th
                                                                        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                    File Name
                                                                </th>
                                                                <th
                                                                        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                    Type
                                                                </th>
                                                                <th
                                                                        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                    Uploaded
                                                                </th>
                                                                <th
                                                                        class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                >
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                            </thead>
                                                            <tbody class="bg-white divide-y divide-gray-200">
                                                            {#each subject.files as file}
                                                                <tr class="hover:bg-gray-50">
                                                                    <td class="px-4 py-3 whitespace-nowrap">
                                                                        <div class="flex items-center">
                                                                            <div
                                                                                    class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3"
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
                                                                                <div
                                                                                        class="text-sm font-medium text-gray-900"
                                                                                >
                                                                                    {file.display_name}
                                                                                </div>
                                                                                <div class="text-sm text-gray-500">
                                                                                    ID: {file.id}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td class="px-4 py-3 whitespace-nowrap">
                                      <span
                                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                      >
                                        {file.file_type_name}
                                      </span>
                                                                    </td>
                                                                    <td
                                                                            class="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                                                                    >
                                                                        {new Date(
                                                                            file.uploaded_at
                                                                        ).toLocaleDateString()}
                                                                    </td>
                                                                    <td
                                                                            class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                                                                    >
                                                                        <div
                                                                                class="flex items-center justify-end space-x-2"
                                                                        >
                                                                            <a
                                                                                    href="/download/{file.id}"
                                                                                    rel="external"
                                                                                    class="text-indigo-600 hover:text-indigo-900 text-sm"
                                                                            >
                                                                                Download
                                                                            </a>
                                                                            <button
                                                                                    onclick={() => startEdit(file)}
                                                                                    class="text-blue-600 hover:text-blue-900 text-sm"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                    onclick={() => confirmDelete(file)}
                                                                                    class="text-red-600 hover:text-red-900 text-sm"
                                                                            >
                                                                                Delete
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
                            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <svg
                                class="w-8 h-8 text-gray-400"
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
                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                        No Files Uploaded
                    </h3>
                    <p class="text-gray-500 mb-4">
                        Get started by uploading your first file.
                    </p>
                    <a
                            href="/admin/upload"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
        <div
                class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        >
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Edit File</h3>

                <form
                        bind:this={editForm}
                        method="POST"
                        action="?/updateNote"
                        use:enhance={() => {
            return async ({ result }) => {
              if (result.type === "success") {
                handleEditSuccess();
              }
            };
          }}
                >
                    <input type="hidden" name="id" value={editingFile.id}/>

                    <div class="mb-4">
                        <label
                                for="displayName"
                                class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            File Name
                        </label>
                        <input
                                type="text"
                                name="displayName"
                                id="displayName"
                                bind:value={editingFile.display_name}
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div class="mb-4">
                        <label
                                for="classId"
                                class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Class
                        </label>
                        <select
                                name="classId"
                                id="classId"
                                bind:value={editingFile.class_id}
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Subject
                        </label>
                        <select
                                name="subjectId"
                                id="subjectId"
                                bind:value={editingFile.subject_id}
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            File Type
                        </label>
                        <select
                                name="fileTypeId"
                                id="fileTypeId"
                                bind:value={editingFile.file_type_id}
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a file type</option>
                            {#each data.fileTypes as fileType}
                                <option value={fileType.id}>{fileType.name}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="flex items-center justify-end space-x-3">
                        <button
                                type="button"
                                onclick={cancelEdit}
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                                type="submit"
                                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save Changes
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
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
        <div
                class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        >
            <div class="mt-3 text-center">
                <div
                        class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
                >
                    <svg
                            class="h-6 w-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                    >
                        <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        ></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Delete File</h3>
                <p class="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete "<strong
                >{fileToDelete.display_name}</strong
                >"? This action cannot be undone and will permanently remove the file
                    from storage.
                </p>

                <form
                        method="POST"
                        action="?/deleteNote"
                        use:enhance={() => {
            return async ({ result }) => {
              if (result.type === "success") {
                handleDeleteSuccess();
              }
            };
          }}
                >
                    <input type="hidden" name="id" value={fileToDelete.id}/>

                    <div class="flex items-center justify-center space-x-3">
                        <button
                                type="button"
                                onclick={cancelDelete}
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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
