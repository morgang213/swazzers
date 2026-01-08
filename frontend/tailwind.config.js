/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'status-ok': '#10B981',
        'status-warning': '#F59E0B',
        'status-critical': '#F43F5E',
        'status-info': '#3B82F6',
        'brand-primary': '#14B8A6',
        'brand-primary-dark': '#0F766E',
        'brand-primary-light': '#CCFBF1',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
