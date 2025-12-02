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
        // Love Facts Branding Colors (from Pantone PDF)
        lovefacts: {
          // Dark Teal - CMYK(94, 61, 44, 41)
          teal: '#0A3D4C',
          'teal-light': '#0D4D5F',
          'teal-dark': '#082F3B',
          // Turquoise - CMYK(69, 0, 38, 0)
          turquoise: '#4FC9A0',
          'turquoise-light': '#6DD4B2',
          'turquoise-dark': '#3EB88D',
          // Coral - CMYK(16, 77, 70, 5)
          coral: '#D6534A',
          'coral-light': '#E06B63',
          'coral-dark': '#C44038',
          // Olive Green - CMYK(60, 21, 80, 0)
          green: '#66A833',
          'green-light': '#7AB84A',
          'green-dark': '#559226',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
