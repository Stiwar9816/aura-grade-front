import {Html, Head, Main, NextScript} from "next/document";

export default function Document() {
	return (
		<Html lang="es">
			<Head>
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#2855ad" />

			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
