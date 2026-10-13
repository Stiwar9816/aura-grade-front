import type {Metadata} from 'next';
import {publicPages, siteOrigin} from '@/lib/site';
import Image from 'next/image';
import Link from 'next/link';
import HomeAccess from '@/components/HomeAccess';
import PlanetBackground from '@/components/Home/PlanetBackground';
import ThemeSelect from '@/components/Home/ThemeSelect';
import ProductFeatures, {HomeFaq} from '@/components/Home/ProductFeatures';
import styles from './home.module.css';

export const metadata: Metadata = {
 ...(siteOrigin ? {alternates: {canonical: siteOrigin}} : {}),
 openGraph: {title: publicPages['/'].title, description: publicPages['/'].description, type: 'website', locale: 'es_CO', siteName: 'AuraGrade', ...(siteOrigin ? {url: siteOrigin, images: [{url: `${siteOrigin}${publicPages['/'].image}`, width: 1200, height: 630, alt: publicPages['/'].imageAlt}]} : {})},
 twitter: {card: 'summary_large_image', title: publicPages['/'].title, description: publicPages['/'].description, ...(siteOrigin ? {images: [{url: `${siteOrigin}${publicPages['/'].image}`, alt: publicPages['/'].imageAlt}]} : {})},
};

const criteria = [
 {name: 'Argumentación', weight: '30 %', score: '4,0', fill: '80%'},
 {name: 'Uso de fuentes', weight: '20 %', score: '3,5', fill: '70%'},
 {name: 'Análisis crítico', weight: '30 %', score: '4,5', fill: '90%'},
 {name: 'Comunicación', weight: '20 %', score: '4,0', fill: '80%'},
];
const steps = [
 {title: 'Define el criterio.', text: 'Organiza el curso y la tarea. Establece una rúbrica con criterios y ponderaciones que el estudiante pueda consultar antes de entregar.', tag: 'Rúbricas y tareas'},
 {title: 'Revisa la evidencia.', text: 'La IA prepara una propuesta a partir de la entrega y la rúbrica. Contrasta los resultados, ajusta la nota y aporta tu retroalimentación.', tag: 'Evaluación asistida'},
 {title: 'Publica con fundamento.', text: 'Comparte la calificación y las observaciones cuando estén listas. El estudiante consulta el resultado y puede solicitar una revisión.', tag: 'Retroalimentación'},
];

export default function HomePage() {
 return <div className={styles.home}>
  <a href="#main-content" className="skip-link">Saltar al contenido</a>
  <PlanetBackground />
  <header className={styles.header}>
   <div className={styles.nav}>
    <Link href="/" aria-label="AuraGrade — Inicio" className={styles.brand}><Image src="/logo.png" width={190} height={72} alt="AuraGrade" priority /></Link>
    <nav aria-label="Navegación principal" className={styles.navLinks}><a href="#funciones">Funciones</a><a href="#comunidad">Para quién</a><a href="#proceso">Cómo funciona</a><Link href="/help">Ayuda</Link></nav>
    <div className={styles.navActions}><ThemeSelect /><HomeAccess /></div>
   </div>
  </header>
  <main id="main-content" tabIndex={-1}>
   <section className={styles.hero} aria-labelledby="welcome-title">
    <div className={styles.heroAtmosphere} aria-hidden="true"><div className={styles.orbit}/><div className={styles.orbit}/><div className={styles.orbit}/></div>
    <div className={styles.heroCopy}>
     <p className={styles.intro}><span aria-hidden="true"/>Evaluación académica con rúbricas</p>
     <h1 id="welcome-title">Cada nota,<br/>con fundamento.</h1>
     <p className={styles.lead}>Más claridad para aprender. Más criterio para evaluar.</p>
     <p className={styles.description}>Un espacio para estudiantes, docentes e instituciones. Conecta cursos, entregas y retroalimentación, con IA de apoyo y la decisión en manos del docente.</p>
     <div className={styles.actions}><HomeAccess primary /><a href="#comunidad" className={styles.secondary}>Descubre tu espacio <span aria-hidden="true">↓</span></a></div>
     <p className={styles.accessNote}>¿Tu institución usa AuraGrade? <Link href="/register">Solicita una cuenta</Link></p>
    </div>
    <div className={styles.previewWrap} id="evaluacion">
     <div className={styles.previewLabel}><span>Así se construye una evaluación</span><span className={styles.example}>Ejemplo ilustrativo</span></div>
     <figure className={styles.preview}>
      <figcaption className={styles.previewHeading}><div><span className={styles.documentIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z"/><path d="M14 3v5h5M8 12h8M8 16h5"/></svg></span><div><strong>Ensayo argumentativo</strong><p>Análisis y uso de fuentes</p></div></div><span className={styles.reviewStatus}>Revisión docente</span></figcaption>
      <div className={styles.previewBody}>
       <div className={styles.rubric}>
        <div className={styles.panelTitle}><h2>Rúbrica de evaluación</h2><span>Escala 0–5</span></div>
        <table><caption className="sr-only">Calificaciones ilustrativas por criterio, sin datos de estudiantes</caption><thead><tr><th scope="col">Criterio</th><th scope="col">Peso</th><th scope="col">Nota</th></tr></thead><tbody>{criteria.map(c => <tr key={c.name}><th scope="row">{c.name}<span className={styles.scoreTrack} aria-hidden="true"><span style={{width: c.fill}}/></span></th><td>{c.weight}</td><td>{c.score}</td></tr>)}</tbody></table>
       </div>
       <div className={styles.feedback}>
        <div className={styles.panelTitle}><h2>Del criterio al aprendizaje</h2></div>
        <p className={styles.feedbackLabel}>Observación del docente · Ejemplo</p>
        <blockquote>“La postura es clara y está respaldada por fuentes. Explica cómo la evidencia citada sostiene tu conclusión.”</blockquote>
        <div className={styles.result}><div><span>Resultado ilustrativo</span><p>4,1 <small>/ 5</small></p></div><span className={styles.resultNote}>Criterios visibles.<br/>Una nota explicada.</span></div>
       </div>
      </div>
      <div className={styles.previewFooter}><span><span aria-hidden="true">✓</span> La publicación requiere revisión docente</span><span>Borrador → Revisión → Publicación</span></div>
     </figure>
    </div>
   </section>
   <ProductFeatures />
   <section id="proceso" className={styles.process} aria-labelledby="process-title">
    <div className={styles.sectionHeading}><p className={styles.kicker}>Un proceso claro</p><h2 id="process-title">Del criterio a la<br/>retroalimentación.</h2><p>Cada etapa tiene un propósito. Cada decisión conserva el contexto que la sustenta.</p></div>
    <ol className={styles.steps}>{steps.map((step, index) => <li key={step.title}><div className={styles.stepTop}><span>0{index + 1}</span><span>{step.tag}</span></div><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
   </section>
   <section className={styles.control} aria-labelledby="control-title">
    <div><p className={styles.kicker}>Criterio docente, herramientas de apoyo</p><h2 id="control-title">La decisión final<br/>sigue siendo tuya.</h2><p>Una sugerencia automática necesita una mirada docente. Revisa la entrega, contrasta la rúbrica y ajusta la evaluación antes de compartirla.</p><Link href="/help" className={styles.textLink}>Explorar la guía de AuraGrade <span aria-hidden="true">↗</span></Link></div>
    <div className={styles.controlList}><article><span aria-hidden="true">01</span><div><h3>El borrador tiene su lugar</h3><p>La propuesta de IA permanece separada de la evaluación publicada.</p></div></article><article><span aria-hidden="true">02</span><div><h3>El estudiante conoce el criterio</h3><p>Consulta la rúbrica de la tarea y recibe las observaciones que publica el docente.</p></div></article><article><span aria-hidden="true">03</span><div><h3>El contexto acompaña la nota</h3><p>La entrega, los criterios y la retroalimentación orientan la revisión académica.</p></div></article></div>
   </section>
   <HomeFaq />
   <section className={styles.closing} aria-labelledby="closing-title"><p className={styles.kicker}>Tu próximo paso</p><h2 id="closing-title">Una evaluación más clara.<br/>Desde la primera rúbrica.</h2><p>Accede a tus cursos, tareas y evaluaciones en AuraGrade.</p><div className={styles.actions}><HomeAccess primary/><Link href="/register" className={styles.secondary}>Solicitar una cuenta</Link></div><small>El registro puede requerir aprobación de tu institución.</small></section>
  </main>
  <footer className={styles.footer}><p>AuraGrade <span>Evaluación académica con criterio.</span></p><nav aria-label="Información y soporte"><Link href="/help">Ayuda</Link><Link href="/privacy">Privacidad</Link><Link href="/terms">Condiciones de uso</Link></nav></footer>
 </div>;
}
