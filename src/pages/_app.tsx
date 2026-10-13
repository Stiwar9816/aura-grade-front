import "@/styles/globals.css";
import Head from "next/head";
import {useRouter} from "next/router";
import {publicPages, siteOrigin} from "@/lib/site";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client/react";
import { Toaster } from "sonner";
import { useEffect } from "react";
import client from "@/lib/apolloClient";
import { AuthProvider } from "@/context/AuthContext";
import PushSubscriptionSync from "@/components/Notifications/PushSubscriptionSync";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { useAuth } from "@/hooks";
import SentryUserSync from "@/components/Observability/SentryUserSync";
import {
  SETTINGS_UPDATED_EVENT,
  applyStoredTheme,
  applyTheme,
  getStoredTheme,
} from "@/utils/theme";

const ThemeController = () => {
  const { user } = useAuth();
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

export default function App({ Component, pageProps }: AppProps) {
  const {pathname} = useRouter();
  const publicPage = publicPages[pathname];
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <SentryUserSync />
        <ConfirmProvider>
          <ThemeController />
          <PushSubscriptionSync />
          <Head>
            <title>{publicPage?.title || 'Tu espacio académico | AuraGrade'}</title>
            <meta name="robots" key="robots" content={publicPage && siteOrigin ? 'index, follow' : 'noindex, nofollow'} />
            {publicPage && <meta name="description" content={publicPage.description} />}
            {publicPage && <meta property="og:title" content={publicPage.title} />}
            {publicPage && <meta property="og:description" content={publicPage.description} />}
            {publicPage && <meta property="og:type" content="website" />}
            {publicPage && <meta property="og:locale" content="es_CO" />}
            {publicPage && <meta property="og:site_name" content="AuraGrade" />}
            {publicPage && siteOrigin && <meta property="og:url" content={`${siteOrigin}${pathname}`} />}
            {publicPage && siteOrigin && <meta property="og:image" content={`${siteOrigin}${publicPage.image}`} />}
            {publicPage && <meta property="og:image:width" content="1200" />}
            {publicPage && <meta property="og:image:height" content="630" />}
            {publicPage && <meta property="og:image:type" content="image/png" />}
            {publicPage && <meta property="og:image:alt" content={publicPage.imageAlt} />}
            {publicPage && <meta name="twitter:card" content="summary_large_image" />}
            {publicPage && <meta name="twitter:title" content={publicPage.title} />}
            {publicPage && <meta name="twitter:description" content={publicPage.description} />}
            {publicPage && siteOrigin && <meta name="twitter:image" content={`${siteOrigin}${publicPage.image}`} />}
            {publicPage && <meta name="twitter:image:alt" content={publicPage.imageAlt} />}
            {publicPage && siteOrigin && <link rel="canonical" href={`${siteOrigin}${pathname}`} />}
          </Head>
          <Component {...pageProps} />
          <Toaster richColors closeButton position="bottom-right" />
        </ConfirmProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
