import type {Metadata} from 'next';
import {publicPages, siteOrigin} from '@/lib/site';
import Image from 'next/image';
import Link from 'next/link';
import HomeAccess from '@/components/HomeAccess';

export const metadata: Metadata = {
 ...(siteOrigin ? {alternates: {canonical: siteOrigin}} : {}),
 openGraph: {title: publicPages['/'].title, description: publicPages['/'].description, type: 'website', locale: 'es_CO', siteName: 'AuraGrade', ...(siteOrigin ? {url: siteOrigin, images: [{url: `${siteOrigin}/logo.png`, width: 775, height: 294, alt: 'AuraGrade'}]} : {})},
 twitter: {card: 'summary', title: publicPages['/'].title, description: publicPages['/'].description},
};

const criteria = [
 {name: 'Argumentación', weight: '30 %', score: '4,0'},
 {name: 'Uso de fuentes', weight: '20 %', score: '3,5'},
 {name: 'Análisis crítico', weight: '30 %', score: '4,5'},
 {name: 'Comunicación', weight: '20 %', score: '4,0'},
];
export default function HomePage() {
 return <div className="min-h-screen bg-white text-gray-900">
  <a href="#main-content" className="skip-link">Saltar al contenido</a>
  <header className="border-b border-gray-200">
   <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
    <Link href="/" aria-label="AuraGrade — Inicio"><Image src="/logo.png" width={190} height={72} alt="AuraGrade" priority className="h-auto w-36 sm:w-48" /></Link>
    <nav aria-label="Navegación principal" className="flex items-center gap-5 text-sm font-medium"><Link href="#proceso" className="hidden sm:block text-gray-600 hover:text-electric-600">Cómo funciona</Link><Link href="/help" className="hidden sm:block text-gray-600 hover:text-electric-600">Ayuda</Link><HomeAccess /></nav>
   </div>
  </header>
  <main id="main-content" tabIndex={-1}>
   <section className="border-b border-gray-200 bg-background-bone">
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-20">
     <div>
      <p className="page-eyebrow mb-5">Evaluación académica con rúbricas</p>
      <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">Cada nota,<br /><span className="text-electric-600">con fundamento.</span></h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-600">Define los criterios. Revisa las evidencias. Publica una evaluación que tus estudiantes puedan comprender.</p>
      <div className="mt-8 flex flex-wrap items-center gap-4"><HomeAccess primary /><Link href="/register" className="min-h-11 inline-flex items-center text-sm font-semibold text-electric-700">Solicitar una cuenta <span aria-hidden="true" className="ml-2">↗</span></Link></div>
      <p className="mt-5 max-w-sm text-sm text-gray-600">La IA prepara un borrador. El docente revisa y decide qué publicar.</p>
     </div>
     <figure className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-4"><span className="text-sm font-semibold">Revisión con rúbrica</span><span className="rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-800">Ejemplo ilustrativo</span></figcaption>
      <div className="p-4 sm:p-5">
       <div className="mb-4 flex justify-between gap-3 text-xs text-gray-600"><span>Ensayo · Análisis y argumentación</span><span>Escala 0–5</span></div>
       <table className="w-full text-left text-sm"><caption className="sr-only">Ejemplo de calificaciones por criterio, sin datos de estudiantes</caption><thead className="border-y border-gray-200 bg-gray-50 text-xs text-gray-600"><tr><th scope="col" className="py-3 pl-3 font-medium">Criterio</th><th scope="col" className="px-2 font-medium">Peso</th><th scope="col" className="pr-3 text-right font-medium">Nota</th></tr></thead><tbody>{criteria.map(c => <tr key={c.name} className="border-b border-gray-100"><th scope="row" className="py-4 pl-3 font-medium">{c.name}</th><td className="px-2 text-gray-600">{c.weight}</td><td className="pr-3 text-right font-semibold text-electric-700">{c.score}</td></tr>)}</tbody></table>
       <div className="mt-4 rounded-lg border-l-2 border-deep-purple bg-gray-50 p-4"><p className="text-xs font-semibold text-gray-600">Observación del docente · Ejemplo</p><p className="mt-2 text-sm leading-relaxed text-gray-700">La postura es clara y está respaldada por fuentes. Explica cómo la evidencia citada sostiene tu conclusión.</p></div>
       <div className="mt-5 flex items-end justify-between border-t border-gray-200 pt-4"><div><p className="text-xs text-gray-600">Resultado ilustrativo</p><p className="mt-1 text-2xl font-semibold tabular-nums text-electric-700">4,1 <span className="text-sm font-normal text-gray-500">/ 5</span></p></div><span className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600">Revisión docente</span></div>
      </div>
     </figure>
    </div>
   </section>
   <section id="proceso" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
    <p className="page-eyebrow">Un proceso claro</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Del criterio a la retroalimentación.</h2>
    <ol className="mt-9 grid gap-8 md:grid-cols-3">{[
     ['Definir', 'El docente establece los criterios y sus ponderaciones. El estudiante puede consultar la rúbrica antes de entregar.'],
     ['Revisar', 'La IA genera una propuesta a partir de la entrega y la rúbrica. El docente contrasta el resultado y ajusta la evaluación.'],
     ['Publicar', 'La nota y las observaciones llegan al estudiante después de la revisión docente. Los borradores se mantienen separados.'],
    ].map(([title, description], index) => <li key={title} className="border-t border-gray-200 pt-5"><span className="text-sm font-semibold tabular-nums text-deep-purple">0{index + 1}</span><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p></li>)}</ol>
   </section>
   <section className="border-y border-gray-200 bg-background-bone">
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:gap-16">
     <div><p className="page-eyebrow">Criterio docente, herramientas de apoyo</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">La decisión final sigue siendo del docente.</h2></div>
     <div className="space-y-5 text-base leading-relaxed text-gray-600"><p>Una sugerencia automática requiere revisión. AuraGrade diferencia el borrador de IA de los resultados publicados y permite consultar el contexto de cada entrega.</p><p>Antes de subir un documento, revisa las condiciones de tu institución y qué información es necesaria para la actividad.</p><div className="flex flex-wrap gap-5 text-sm font-semibold text-electric-700"><Link href="/help">Conocer el proceso →</Link><Link href="/privacy">Uso de los datos →</Link></div></div>
    </div>
   </section>
  </main>
  <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-7 text-sm text-gray-600 sm:px-8"><p>AuraGrade · Evaluación académica</p><nav aria-label="Información y soporte" className="flex flex-wrap gap-5"><Link href="/help">Ayuda</Link><Link href="/privacy">Privacidad</Link><Link href="/terms">Condiciones de uso</Link></nav></footer>
 </div>;
}
