/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
	  extend: {
		colors: {
		  naranja: '#e3a765',
		  amarillo: '#fdd000',
		  claro: '#f2efe2',
		  gris: '#5d6d7c',
		  negro: '#000000',
		},
	  },
	},
	plugins: [],
  }