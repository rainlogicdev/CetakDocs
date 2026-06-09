/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ui: ['var(--font-ui)'],
        'doc-sans': ['var(--font-doc-sans)'],
        'doc-serif': ['var(--font-doc-serif)'],
        'doc-mono': ['var(--font-doc-mono)'],
      },
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          muted: 'var(--color-bg-muted)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        },
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
      }
    },
  },
  plugins: [],
}
