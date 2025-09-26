/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,ts}',
        './src/**/*.component.{html,ts}'
    ],
    theme: {
        extend: {
            fontFamily: {
                'serif': ['Times New Roman', 'Georgia', 'serif'],
                'sans': ['Saira', 'Archivo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
            },
            colors: {
                'solercia': {
                    'primary': 'var(--solercia-primary)',
                    'accent': 'var(--solercia-accent)',
                    'secondary': 'var(--solercia-secondary)',
                    'orange': 'var(--solercia-orange)',
                    'gray': {
                        'dark': 'var(--solercia-gray-dark)',
                        'medium': 'var(--solercia-gray-medium)',
                        'light': 'var(--solercia-gray-light)',
                    },
                    'bg': {
                        'dark': 'var(--solercia-bg-dark)',
                        'darker': 'var(--solercia-bg-darker)',
                    }
                }
            },
            animation: {
                'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
            },
            keyframes: {
                'neon-pulse': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0.8' }
                }
            }
        },
    },
    plugins: [],
}