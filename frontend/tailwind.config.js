/* tailwind.config.js */
module.exports = {
  content: [
    "./pages/*.{js,ts,jsx,tsx}",
    "./src/components/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kpmg_cobalt': '#1E49E2',
        'kpmg_purple': '#7213EA',
        'kpmg_blue': '#00338D',
        'kpmg_dark_blue': '#0C233C',
        'kpmg_light_blue': '#ACEAFF',
        'kpmg_pacific_blue': '#00B8F5',
        'kpmg_pink': '#FD349C'
      }
    },
  },
  plugins: [],
}