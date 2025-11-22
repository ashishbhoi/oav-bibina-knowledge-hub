// Theme store using Svelte 5 runes
class ThemeStore {
	#theme = $state<'light' | 'dark'>('light');

	constructor() {
		// Initialize from localStorage or system preference
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('theme');
			if (stored === 'dark' || stored === 'light') {
				this.#theme = stored;
			} else {
				// Check system preference
				this.#theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
			this.#applyTheme();
		}
	}

	get theme() {
		return this.#theme;
	}

	get isDark() {
		return this.#theme === 'dark';
	}

	toggle() {
		this.#theme = this.#theme === 'dark' ? 'light' : 'dark';
		this.#applyTheme();
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', this.#theme);
		}
	}

	setTheme(theme: 'light' | 'dark') {
		this.#theme = theme;
		this.#applyTheme();
		if (typeof window !== 'undefined') {
			localStorage.setItem('theme', this.#theme);
		}
	}

	#applyTheme() {
		if (typeof document !== 'undefined') {
			if (this.#theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}
}

export const themeStore = new ThemeStore();
