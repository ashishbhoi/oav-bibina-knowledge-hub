<script lang="ts">
    import {page} from '$app/stores';
    import {enhance} from '$app/forms';

    interface Props {
        data: {
            user?: {
                userId: number;
                username: string;
            };
        };
        children: any;
    }

    let {data, children}: Props = $props();
    let showMobileMenu = $state(false);
</script>

{#if $page.url.pathname === '/admin'}
    {@render children()}
{:else}
    <div class="min-h-screen bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-semibold text-gray-900">
                            OAV Bibina Admin
                        </h1>
                    </div>

                    <div class="hidden md:flex items-center space-x-4">
                        <a
                                href="/admin/dashboard"
                                class="px-3 py-2 rounded-md text-sm font-medium {$page.url.pathname === '/admin/dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-gray-900'}"
                        >
                            Dashboard
                        </a>
                        <div class="text-sm text-gray-600">
                            Welcome, {data.user?.username}
                        </div>
                        <form method="POST" action="/admin?/logout" use:enhance>
                            <button
                                    type="submit"
                                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </form>
                    </div>

                    <!-- Mobile menu button -->
                    <div class="md:hidden flex items-center">
                        <button
                                onclick={() => showMobileMenu = !showMobileMenu}
                                class="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                                aria-label="Toggle mobile menu"
                        >
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile menu -->
                {#if showMobileMenu}
                    <div class="md:hidden">
                        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <a
                                    href="/admin/dashboard"
                                    class="block px-3 py-2 rounded-md text-base font-medium {$page.url.pathname === '/admin/dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-gray-900'}"
                            >
                                Dashboard
                            </a>
                            <a
                                    href="/admin/files"
                                    class="block px-3 py-2 rounded-md text-base font-medium {$page.url.pathname === '/admin/files' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-gray-900'}"
                            >
                                Files
                            </a>
                            <a
                                    href="/admin/settings"
                                    class="block px-3 py-2 rounded-md text-base font-medium {$page.url.pathname === '/admin/settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-gray-900'}"
                            >
                                Settings
                            </a>
                            <div class="px-3 py-2 text-sm text-gray-600">
                                Welcome, {data.user?.username}
                            </div>
                            <form method="POST" action="/admin?/logout" use:enhance class="px-3">
                                <button
                                        type="submit"
                                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium w-full text-left"
                                >
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                {/if}
            </div>
        </nav>

        <!-- Main content -->
        <main>
            {@render children()}
        </main>
    </div>
{/if}
