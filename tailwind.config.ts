/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				electric: {
					50: "#EEF3FC",
					100: "#DCE7FA",
					200: "#BCCFF2",
					300: "#8FABE0",
					400: "#587EC6",
					500: "#2855AD",
					600: "#21488F",
					700: "#1C3C75",
					800: "#192F58",
					900: "#132440",
				},
				"deep-purple": "#65509A",
				"deep-violet": "#7660AA",
				cyan: {
					50: "#E6FBFF",
					100: "#CCF7FF",
					200: "#99EFFF",
					300: "#66E7FF",
					400: "#33DFFF",
					500: "#167F99",
					600: "#126A80",
					700: "#007F99",
					800: "#005566",
					900: "#002A33",
				},
				"background-bone": "#F5F7FB",
				"background-light": "#EDF1F7",
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
			},
			animation: {
				"pulse-slow": "pulse 3s ease-in-out infinite",
				float: "float 3s ease-in-out infinite",
				progress: "progress 2s ease-in-out infinite",
				slideIn: "slideIn 0.3s ease-out",
			},
			keyframes: {
				float: {
					"0%, 100%": {transform: "translateY(0)"},
					"50%": {transform: "translateY(-10px)"},
				},
				progress: {
					"0%": {left: "-40%"},
					"100%": {left: "100%"},
				},
				slideIn: {
					from: {transform: "translateX(100%)", opacity: "0"},
					to: {transform: "translateX(0)", opacity: "1"},
				},
			},
		},
	},
	plugins: [],
};
