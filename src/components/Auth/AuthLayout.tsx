import Image from "next/image";
import Link from "next/link";
import {AuthLayoutProps} from "@/interface";

export const AuthLayout: React.FC<AuthLayoutProps> = ({children, title, subtitle, heroTitle, heroSubtitle, features}) => (
 <div className="min-h-screen bg-background-bone">
  <a href="#auth-content" className="skip-link">Saltar al formulario</a>
  <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
   <Link href="/" aria-label="AuraGrade — Inicio"><Image src="/logo.png" alt="AuraGrade" width={190} height={72} priority className="h-auto w-40 sm:w-48" /></Link>
   <Link href="/help" className="text-sm font-medium text-gray-600 hover:text-electric-600">Ayuda y soporte</Link>
  </header>
  <main className="mx-auto grid max-w-6xl items-start gap-10 px-5 pb-10 pt-4 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:pt-10">
   <section className="hidden lg:block pt-10">
    <p className="page-eyebrow mb-5">Evaluación con criterio</p>
    <h2 className="text-4xl font-semibold tracking-tight leading-tight text-gray-900">{heroTitle || <>Cada nota,<br /><span className="text-electric-600">con fundamento.</span></>}</h2>
    <p className="mt-5 max-w-md text-base leading-relaxed text-gray-600">{heroSubtitle || "Rúbricas claras, evidencias a la vista y resultados revisados por el docente. La IA apoya el proceso; la decisión académica sigue en sus manos."}</p>
    {features && <div className="mt-10 space-y-6 border-t border-gray-200 pt-8">{features.map((feature, index) => <div key={index} className="flex items-start gap-4">
     <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-electric-50 text-electric-600">{feature.icon}</span>
     <div><h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3><p className="mt-1 text-sm leading-relaxed text-gray-600">{feature.description}</p></div>
    </div>)}</div>}
   </section>
   <section id="auth-content" tabIndex={-1} className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="mb-7"><h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1><p className="mt-2 text-sm leading-relaxed text-gray-600">{subtitle}</p></div>
    {children}
   </section>
  </main>
  <footer className="mx-auto flex max-w-6xl flex-wrap gap-5 border-t border-gray-200 px-5 py-6 text-xs text-gray-600 sm:px-8"><span>AuraGrade · Evaluación académica</span><Link href="/privacy">Privacidad</Link><Link href="/terms">Condiciones de uso</Link></footer>
 </div>
);
