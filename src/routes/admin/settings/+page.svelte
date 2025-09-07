<script lang="ts">
    import {enhance} from "$app/forms";

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

    let {data, form}: Props = $props();

    let activeTab = $state("classes");
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
        editingItem = {...item};
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
        editingItem = {name: "", class_id: classId};
    }

    function cancelEdit() {
        editingItem = null;
    }

    function setActiveTab(tab: string) {
        activeTab = tab;
        editingItem = null;
    }
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <!-- Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
            <div class="flex justify-between items-center">
                <h1 class="text-3xl font-bold text-gray-900">Admin Settings</h1>
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
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Success/Error Messages -->
        {#if form?.success}
            <div
                    class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
            >
                <strong>Success!</strong>
                {form.message}
            </div>
        {:else if form?.message}
            <div
                    class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
                <strong>Error:</strong>
                {form.message}
            </div>
        {/if}

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-8">
            <nav class="-mb-px flex space-x-8">
                <button
                        class={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "classes"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
                        onclick={() => setActiveTab("classes")}
                >
                    Classes
                </button>
                <button
                        class={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "subjects"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
                        onclick={() => setActiveTab("subjects")}
                >
                    Subjects
                </button>
                <button
                        class={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "fileTypes"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
                        onclick={() => setActiveTab("fileTypes")}
                >
                    File Types
                </button>
                <button
                        class={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "admin"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
                        onclick={() => setActiveTab("admin")}
                >
                    Admin Account
                </button>
            </nav>
        </div>

        <!-- Classes Tab -->
        {#if activeTab === "classes"}
            <div class="space-y-6">
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">Manage Classes</h2>

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
                            class="mb-6 p-4 border border-gray-200 rounded-lg"
                    >
                        <h3 class="text-sm font-medium text-gray-700 mb-3">
                            Add New Class
                        </h3>
                        <div class="flex gap-3">
                            <input
                                    type="text"
                                    name="name"
                                    placeholder="Class name"
                                    required
                                    class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                    type="submit"
                                    disabled={isLoading}
                                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? "Adding..." : "Add Class"}
                            </button>
                        </div>
                    </form>

                    <!-- Classes List -->
                    <div class="space-y-3">
                        {#each data.classes as cls}
                            <div
                                    class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
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
                                            class="flex items-center gap-3 flex-1"
                                    >
                                        <input type="hidden" name="id" value={cls.id}/>
                                        <input
                                                type="text"
                                                name="name"
                                                value={editingItem.name}
                                                oninput={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target) editingItem.name = target.value;
                      }}
                                                class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                                type="submit"
                                                disabled={isLoading}
                                                class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                                type="button"
                                                onclick={cancelEdit}
                                                class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                {:else}
                                    <!-- Display Mode -->
                                    <span class="font-medium text-gray-900">{cls.name}</span>
                                    <div class="flex gap-2">
                                        <button
                                                onclick={() => startEdit(cls)}
                                                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <form
                                                method="POST"
                                                action="?/deleteClass"
                                                use:enhance={() => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this class? This will also delete all associated subjects and notes."
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
                                            <input type="hidden" name="id" value={cls.id}/>
                                            <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                        {#if data.classes.length === 0}
                            <p class="text-gray-500 text-center py-8">
                                No classes found. Add one above to get started.
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}

        <!-- File Types Tab -->
        {#if activeTab === "fileTypes"}
            <div class="space-y-6">
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">
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
                            class="mb-6 p-4 border border-gray-200 rounded-lg"
                    >
                        <h3 class="text-sm font-medium text-gray-700 mb-3">
                            Add New File Type
                        </h3>
                        <div class="flex gap-3">
                            <input
                                    type="text"
                                    name="name"
                                    placeholder="File type name (e.g., PDF, Word Document, PowerPoint)"
                                    required
                                    class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                    type="submit"
                                    disabled={isLoading}
                                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? "Adding..." : "Add File Type"}
                            </button>
                        </div>
                    </form>

                    <!-- File Types List -->
                    <div class="space-y-3">
                        {#each data.fileTypes as fileType}
                            <div
                                    class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
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
                                            class="flex items-center gap-3 flex-1"
                                    >
                                        <input type="hidden" name="id" value={fileType.id}/>
                                        <input
                                                type="text"
                                                name="name"
                                                value={editingItem.name}
                                                oninput={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target) editingItem.name = target.value;
                      }}
                                                class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                                type="submit"
                                                disabled={isLoading}
                                                class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                                type="button"
                                                onclick={cancelEdit}
                                                class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                {:else}
                                    <!-- Display Mode -->
                                    <span class="font-medium text-gray-900">{fileType.name}</span>
                                    <div class="flex gap-2">
                                        <button
                                                onclick={() => startEdit(fileType)}
                                                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <form
                                                method="POST"
                                                action="?/deleteFileType"
                                                use:enhance={() => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this file type? This will also delete all associated notes."
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
                                            <input type="hidden" name="id" value={fileType.id}/>
                                            <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                        {#if data.fileTypes.length === 0}
                            <p class="text-gray-500 text-center py-8">
                                No file types found. Add one above to get started.
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}

        <!-- Subjects Tab -->
        {#if activeTab === "subjects"}
            <div class="space-y-6">
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-6">
                        Manage Subjects by Class
                    </h2>

                    {#each data.classes as cls}
                        {@const classSubjects = subjectsByClass().get(cls.id) || []}
                        <div class="border border-gray-200 rounded-lg mb-4">
                            <!-- Class Header -->
                            <div
                                    class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200"
                            >
                                <button
                                        onclick={() => toggleClassExpansion(cls.id)}
                                        class="flex items-center space-x-2 text-left flex-1"
                                >
                                    <svg
                                            class={`w-5 h-5 transition-transform ${expandedClasses.has(cls.id) ? "rotate-90" : ""}`}
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
                                    <div>
                                        <h3 class="text-lg font-medium text-gray-900">
                                            {cls.name}
                                        </h3>
                                        <p class="text-sm text-gray-500">
                                            {classSubjects.length} subjects
                                        </p>
                                    </div>
                                </button>
                                <button
                                        onclick={() => startAddSubject(cls.id)}
                                        class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                    Add Subject
                                </button>
                            </div>

                            <!-- Collapsible Content -->
                            {#if expandedClasses.has(cls.id)}
                                <div class="p-4">
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
                                                class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                        >
                                            <h4 class="text-sm font-medium text-gray-700 mb-3">
                                                Add New Subject to {cls.name}
                                            </h4>
                                            <div class="flex gap-3">
                                                <input type="hidden" name="class_id" value={cls.id}/>
                                                <input
                                                        type="text"
                                                        name="name"
                                                        bind:value={editingItem.name}
                                                        placeholder="Subject name"
                                                        required
                                                        class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {isLoading ? "Adding..." : "Add"}
                                                </button>
                                                <button
                                                        type="button"
                                                        onclick={() => {
                            newSubjectClassId = null;
                            editingItem = null;
                          }}
                                                        class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    {/if}

                                    <!-- Subjects List -->
                                    <div class="space-y-2">
                                        {#each classSubjects as subject}
                                            <div
                                                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                                                            class="flex items-center gap-3 flex-1"
                                                    >
                                                        <input type="hidden" name="id" value={subject.id}/>
                                                        <input
                                                                type="hidden"
                                                                name="class_id"
                                                                value={subject.class_id}
                                                        />
                                                        <input
                                                                type="text"
                                                                name="name"
                                                                bind:value={editingItem.name}
                                                                required
                                                                class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                                type="submit"
                                                                disabled={isLoading}
                                                                class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {isLoading ? "Saving..." : "Save"}
                                                        </button>
                                                        <button
                                                                type="button"
                                                                onclick={() => (editingItem = null)}
                                                                class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </form>
                                                {:else}
                                                    <!-- Display Mode -->
                                                    <div class="flex-1">
                                                        <h4 class="font-medium text-gray-900">
                                                            {subject.name}
                                                        </h4>
                                                        <p class="text-sm text-gray-500">
                                                            Created: {new Date(
                                                            subject.created_at
                                                        ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div class="flex gap-2">
                                                        <button
                                                                onclick={() => startEdit(subject)}
                                                                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <form
                                                                method="POST"
                                                                action="?/deleteSubject"
                                                                use:enhance={() => {
                                if (
                                  !confirm(
                                    "Are you sure you want to delete this subject? This will also delete all associated notes."
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
                                                            <input
                                                                    type="hidden"
                                                                    name="id"
                                                                    value={subject.id}
                                                            />
                                                            <button
                                                                    type="submit"
                                                                    disabled={isLoading}
                                                                    class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </form>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/each}
                                        {#if classSubjects.length === 0}
                                            <p class="text-gray-500 text-center py-4">
                                                No subjects found for this class.
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/each}

                    {#if data.classes.length === 0}
                        <div class="text-center py-8">
                            <p class="text-gray-500">
                                No classes found. Create a class first to manage subjects.
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Admin Account Tab -->
        {#if activeTab === "admin"}
            <div class="space-y-6">
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">
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
                            class="space-y-4 max-w-md"
                    >
                        <div>
                            <label
                                    for="current_password"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Current Password
                            </label>
                            <input
                                    type="password"
                                    id="current_password"
                                    name="current_password"
                                    required
                                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label
                                    for="username"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                            >
                                New Username
                            </label>
                            <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    required
                                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label
                                    for="new_password"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                            >
                                New Password
                            </label>
                            <input
                                    type="password"
                                    id="new_password"
                                    name="new_password"
                                    required
                                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                                type="submit"
                                disabled={isLoading}
                                class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? "Updating..." : "Update Credentials"}
                        </button>
                    </form>
                </div>
            </div>
        {/if}
    </main>
</div>
