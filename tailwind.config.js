/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Outfit', 'sans-serif'],
				heading: ['Fredoka', 'sans-serif'],
			},
			colors: {
				brand: {
					blue: '#4CC9F0',
					purple: '#7209B7',
					pink: '#F72585',
					yellow: '#FFD60A',
					green: '#06D6A0',
					dark: '#1B1B3A',
				},
			},
		},
	},
	plugins: [],
};
