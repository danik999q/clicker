/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                surface: 'var(--surface-color)',
                border: 'var(--border-color)',
                primary: 'var(--primary-accent)',
                secondary: 'var(--secondary-accent)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)'
            },
            backgroundColor: {
                surface: 'var(--surface-color)',
                bg: 'var(--bg-color)'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            }
        }
    },
    plugins: []
};