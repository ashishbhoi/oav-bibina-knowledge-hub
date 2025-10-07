<script lang="ts">
  interface Props {
    data: {
      class: {
        id: number;
        name: string;
        created_at: string;
      };
      subjects: Array<{
        id: number;
        name: string;
        slug: string;
        class_id: number;
        created_at: string;
      }>;
    };
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>{data.class.name} - Subjects | OAV Bibina Knowledge Hub</title>
  <meta
    name="description"
    content="Browse subjects and study materials for {data.class
      .name}. Access comprehensive notes and academic resources."
  />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
        <a class="hover:text-blue-600" href="/">Home</a>
        <span>/</span>
        <span class="text-gray-900">{data.class.name}</span>
      </nav>
      <h1 class="text-3xl font-bold text-center text-gray-900">
        {data.class.name} - Subjects
      </h1>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-2">
        Select a Subject
      </h2>
      <p class="text-gray-600">
        Choose a subject to access related study materials
      </p>
    </div>

    {#if data.subjects.length > 0}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {#each data.subjects as subject}
          <a
            href="/{data.class.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')}/{subject.slug}"
            class="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-green-300"
          >
            <div class="text-center">
              <div
                class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-green-600"
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
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {subject.name}
              </h3>
              <p class="text-sm text-gray-500">Study Materials</p>
            </div>
          </a>
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No Subjects Available
        </h3>
        <p class="text-gray-500">
          Subjects for this class will appear here once they are added.
        </p>
      </div>
    {/if}
  </main>

  <!-- Back Button -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
    <a
      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      href="/"
    >
      <svg
        class="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        ></path>
      </svg>
      Back to Classes
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
