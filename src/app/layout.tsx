import {publicPages, siteOrigin} from "@/lib/site";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import SentryUserSync from "@/components/Observability/SentryUserSync";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
 title: publicPages['/'].title,
 description: publicPages['/'].description,
 manifest: '/site.webmanifest',
 ...(siteOrigin ? {metadataBase: new URL(siteOrigin)} : {}),
 robots: {index: Boolean(siteOrigin), follow: true},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning data-lt-installed>
      <body className="antialiased">
        <AuthProvider>
          <SentryUserSync />
          <Analytics/>
          <SpeedInsights/>
          <ConfirmProvider>{children}</ConfirmProvider>
          <Toaster richColors closeButton position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
