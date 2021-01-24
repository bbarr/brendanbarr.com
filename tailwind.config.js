module.exports = {
  purge: {
    enabled: true,
    content: ['./site/**/*.html'],
  },
  theme: {
    extend: {
      colors: {
        pink: {
          500: 'rgb(255, 160, 160)'
        }
      }
    }
  },
  variants: {},
  plugins: [],
}
