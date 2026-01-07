/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				electric: {
					50: "#E6F0FF",
					100: "#CCE0FF",
					200: "#99C2FF",
					300: "#66A3FF",
					400: "#3385FF",
					500: "#0066FF",
					600: "#0052CC",
					700: "#003D99",
					800: "#002966",
					900: "#001433",
				},
				"deep-purple": "#4B0082",
				"deep-violet": "#9400D3",
				cyan: {
					50: "#E6FBFF",
					100: "#CCF7FF",
					200: "#99EFFF",
					300: "#66E7FF",
					400: "#33DFFF",
					500: "#00D4FF",
					600: "#00AACC",
					700: "#007F99",
					800: "#005566",
					900: "#002A33",
				},
				"background-bone": "#F9F7F5",
				"background-light": "#F0F2F5",
			},
			fontFamily: {
				sans: ["Inter", "Geist", "system-ui", "sans-serif"],
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
