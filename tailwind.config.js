/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        apple: {
          blue: '#0071e3',
          hoverBlue: '#0077ed',
          darkBg: '#0b0c10',
          darkSurface: '#15161e',
          glassBorder: 'rgba(255, 255, 255, 0.08)',
          glassHighlight: 'rgba(255, 255, 255, 0.15)',
          ghostBg: 'rgba(99, 102, 241, 0.12)',
          ghostBorder: 'rgba(129, 140, 248, 0.45)',
        }
      },
      boxShadow: {
        'apple-glass': '0 20px 40px -15px rgba(0,0,0,0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'apple-glow': '0 0 25px 2px rgba(0, 113, 227, 0.35)',
        'ghost-glow': '0 0 25px 4px rgba(99, 102, 241, 0.35)',
        'apple-subtle': '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
