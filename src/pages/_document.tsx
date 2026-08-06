import {Html, Head, Main, NextScript} from "next/document";

export default function Document() {
	return (
		<Html lang="es">
			<Head>
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#2563eb" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
