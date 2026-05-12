import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {ApolloProvider} from "@apollo/client/react";
import client from "@/lib/apolloClient";
import {useEffect} from "react";
import {
	SETTINGS_UPDATED_EVENT,
	applyStoredTheme,
	applyTheme,
	getStoredTheme,
} from "@/utils/theme";

export default function App({Component, pageProps}: AppProps) {
	useEffect(() => {
		applyStoredTheme();

		const syncTheme = () => applyStoredTheme();
		const handleSystemThemeChange = () => {
			try {
				const rawUser = window.localStorage.getItem("auraGrade_user");
				const user = rawUser ? JSON.parse(rawUser) : null;
				const theme = getStoredTheme(user?.id);

				if (theme === "auto") {
					applyTheme("auto");
				}
			} catch {
				applyTheme("light");
			}
		};
		const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

		window.addEventListener(SETTINGS_UPDATED_EVENT, syncTheme);
		window.addEventListener("auraGrade_user_updated", syncTheme);
		window.addEventListener("storage", syncTheme);
		mediaQuery?.addEventListener("change", handleSystemThemeChange);

		return () => {
			window.removeEventListener(SETTINGS_UPDATED_EVENT, syncTheme);
			window.removeEventListener("auraGrade_user_updated", syncTheme);
			window.removeEventListener("storage", syncTheme);
			mediaQuery?.removeEventListener("change", handleSystemThemeChange);
		};
	}, []);

	return (
		<ApolloProvider client={client}>
			<Component {...pageProps} />
		</ApolloProvider>
	);
}
