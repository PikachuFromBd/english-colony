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
                primary: {
                    50: '#eff6ff',  // Very light blue (backgrounds)
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6', // ✅ MAIN BUTTON COLOR (Bright Blue)
                    600: '#2563eb', // Button Hover
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#0f172a', // ✅ WEBSITE BACKGROUND (Deep Navy/Black)
                }
            },
            fontFamily: {
                heading: ['Poppins', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
