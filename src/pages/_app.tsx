import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {ApolloProvider} from "@apollo/client/react";
import {useEffect} from "react";
import client from "@/lib/apolloClient";
import {AuthProvider} from "@/context/AuthContext";
import {useAuth} from "@/hooks";
import {
	SETTINGS_UPDATED_EVENT,
	applyStoredTheme,
	applyTheme,
	getStoredTheme,
} from "@/utils/theme";

const ThemeController = () => {
	const {user} = useAuth();
	const userId = user?.id;

	useEffect(() => {
		applyStoredTheme(userId);

		const syncTheme = () => applyStoredTheme(userId);
		const handleSystemThemeChange = () => {
			if (getStoredTheme(userId) === "auto") {
				applyTheme("auto");
			}
		};
		const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

		window.addEventListener(SETTINGS_UPDATED_EVENT, syncTheme);
		window.addEventListener("storage", syncTheme);
		mediaQuery?.addEventListener("change", handleSystemThemeChange);

		return () => {
			window.removeEventListener(SETTINGS_UPDATED_EVENT, syncTheme);
			window.removeEventListener("storage", syncTheme);
			mediaQuery?.removeEventListener("change", handleSystemThemeChange);
		};
	}, [userId]);

	return null;
};

export default function App({Component, pageProps}: AppProps) {
	return (
		<ApolloProvider client={client}>
			<AuthProvider>
				<ThemeController />
				<Component {...pageProps} />
			</AuthProvider>
		</ApolloProvider>
	);
}
