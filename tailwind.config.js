/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.js',
    './components/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        desa: {
          green: '#2F5D3A',
          leaf: '#4C8B5A',
          cream: '#F6F3EA',
          soil: '#7A5A3A',
          gold: '#D9A441',
        },
      },
    },
  },
  plugins: [],
};
