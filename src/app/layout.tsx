import type {Metadata} from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Aura Grade - Clasificación asistida por IA",
	description:
		"Una plataforma progresiva para la gestión educativa eficiente y escalable, potenciada por IA.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" suppressHydrationWarning data-lt-installed>
			<body className="antialiased">{children}</body>
		</html>
	);
}
