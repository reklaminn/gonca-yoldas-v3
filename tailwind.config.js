/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        // Design tokens - use CSS variables
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        background: 'var(--bg)',
        foreground: 'var(--fg)',
        muted: 'var(--fg-muted)',
        border: 'var(--border)',
        'surface-1': 'var(--surface-1)',
      },
      borderRadius: {
        lg: 'var(--radius, 1rem)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        DEFAULT: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
