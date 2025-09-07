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

    let {data}: Props = $props();
</script>

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 class="text-3xl font-bold text-center text-gray-900">
                OAV Bibina Knowledge Hub
            </h1>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold text-gray-700 mb-2">Select Your Class</h2>
            <p class="text-gray-600">Choose your class to access study materials and notes</p>
        </div>

        {#if data.classes.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {#each data.classes as classItem}
                    <a
                            href="/{classItem.slug}"
                            class="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-blue-300"
                    >
                        <div class="text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">{classItem.name}</h3>
                            <p class="text-sm text-gray-500">Study Materials</p>
                        </div>
                    </a>
                {/each}
            </div>
        {:else}
            <div class="text-center py-12">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Classes Available</h3>
                <p class="text-gray-500">Classes will appear here once they are added by the administrator.</p>
            </div>
        {/if}
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="text-center text-gray-500 text-sm">
                <p>&copy; 2025 OAV Bibina Knowledge Hub. All rights reserved.</p>
            </div>
        </div>
    </footer>
</div>
