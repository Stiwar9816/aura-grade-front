import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import SentryUserSync from "@/components/Observability/SentryUserSync";

export const metadata: Metadata = {
  title: "Aura Grade - Clasificación asistida por IA",
  description:
    "Una plataforma progresiva para la gestión educativa eficiente y escalable, potenciada por IA.",
  manifest: "/site.webmanifest",
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
          <ConfirmProvider>{children}</ConfirmProvider>
          <Toaster richColors closeButton position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
