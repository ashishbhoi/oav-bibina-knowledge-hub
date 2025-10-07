<script lang="ts">
  interface Props {
    data: {
      classes: Array<{
        id: number;
        name: string;
        slug: string;
        created_at: string;
      }>;
    };
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Dashboard | Admin | OAV Bibina Knowledge Hub</title>
  <meta
    name="description"
    content="Admin dashboard for managing classes and content."
  />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-600 mt-2">
          Manage classes, subjects, and study materials
        </p>
      </div>
      <a
        class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        href="/admin/settings"
      >
        Settings
      </a>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <a
      class="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors"
      href="/admin/settings"
    >
      <div class="flex items-center">
        <div
          class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">Add Class</h3>
          <p class="text-sm text-gray-600">Create a new class</p>
        </div>
      </div>
    </a>

    <a
      class="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors"
      href="/admin/settings"
    >
      <div class="flex items-center">
        <div
          class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">Add Subject</h3>
          <p class="text-sm text-gray-600">Create a new subject</p>
        </div>
      </div>
    </a>

    <a
      class="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 transition-colors"
      href="/admin/upload"
    >
      <div class="flex items-center">
        <div
          class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">Upload Files</h3>
          <p class="text-sm text-gray-600">Add study materials</p>
        </div>
      </div>
    </a>

    <a
      class="bg-indigo-50 border border-indigo-200 rounded-lg p-6 hover:bg-indigo-100 transition-colors"
      href="/admin/files"
    >
      <div class="flex items-center">
        <div
          class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">Manage Files</h3>
          <p class="text-sm text-gray-600">Edit and delete files</p>
        </div>
      </div>
    </a>
  </div>

  <!-- Classes Overview -->
  <div class="bg-white shadow rounded-lg">
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">Classes</h2>
        <div class="flex space-x-2">
          <a
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            href="/admin/upload"
          >
            Upload File
          </a>
          <a
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            href="/admin/settings"
          >
            Add Class
          </a>
        </div>
      </div>
    </div>

    {#if data.classes.length > 0}
      <div class="divide-y divide-gray-200">
        {#each data.classes as classItem}
          <div class="px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                <h3 class="text-lg font-medium text-gray-900">
                  {classItem.name}
                </h3>
                <p class="text-sm text-gray-500">
                  Created: {new Date(classItem.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <a
                href="/{classItem.slug}"
                target="_blank"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Public
              </a>
              <a
                href="/admin/upload?class_id={classItem.id}"
                class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-sm font-medium"
              >
                Upload File
              </a>
              <a
                href="/admin/files?class_id={classItem.id}"
                class="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm font-medium"
              >
                Manage
              </a>
              <a
                href="/admin/settings"
                class="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded text-sm font-medium"
              >
                Edit
              </a>
            </div>
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No Classes Created
        </h3>
        <p class="text-gray-500 mb-4">
          Get started by creating your first class.
        </p>
        <a
          href="/admin/settings"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create First Class
        </a>
      </div>
    {/if}
  </div>
</div>
