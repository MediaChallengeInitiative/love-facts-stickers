import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      '3xs': '320px',
      '2xs': '360px',
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lovefacts: {
          teal: '#0A3D4C',
          'teal-light': '#0D4D5F',
          'teal-dark': '#082F3B',
          turquoise: '#4FC9A0',
          'turquoise-light': '#6DD4B2',
          'turquoise-dark': '#3EB88D',
          coral: '#D6534A',
          'coral-light': '#E06B63',
          'coral-dark': '#C44038',
          green: '#66A833',
          'green-light': '#7AB84A',
          'green-dark': '#559226',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fluid type — let headlines breathe across viewports without breakpoint sprawl.
        'fluid-h1': ['clamp(2rem, 5vw + 1rem, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'fluid-h2': ['clamp(1.5rem, 3vw + 0.5rem, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};
export default config;
