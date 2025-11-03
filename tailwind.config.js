module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        casino: {
          red: '#DC143C', // Crimson red
          gold: '#FFD700', // Gold
          'dark-red': '#8B0000', // Dark red
          black: '#1a1a1a', // Rich black
          'light-gold': '#FFF4E6', // Light gold/cream
          green: '#228B22', // Casino table green
        },
      },
    },
    borderWidth: {
      DEFAULT: '1px',
      0: '0',
      2: '2px',
      3: '3px',
      4: '4px',
      6: '6px',
      8: '8px',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
