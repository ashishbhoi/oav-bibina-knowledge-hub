<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';

	interface Props {
		variant?: 'default' | 'sidebar';
	}

	let { variant = 'default' }: Props = $props();
</script>

<button
	onclick={() => themeStore.toggle()}
	class={variant === 'sidebar'
		? 'w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
		: 'p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'}
	aria-label="Toggle theme"
	title="Toggle theme"
>
	{#if themeStore.isDark}
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
			></path>
		</svg>
		{#if variant === 'sidebar'}
			<span class="font-medium">Light Mode</span>
		{/if}
	{:else}
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			></path>
		</svg>
		{#if variant === 'sidebar'}
			<span class="font-medium">Dark Mode</span>
		{/if}
	{/if}
</button>
