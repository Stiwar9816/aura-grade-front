import Link from 'next/link';
import AudienceExplorer from './AudienceExplorer';
import {helpFaqs} from '@/data/help';
import styles from '@/app/home.module.css';

const features = [
 {icon: 'courses', title: 'Tus cursos, conectados.', description: 'Organiza estudiantes, tareas y fechas de entrega. Mantén el trabajo de cada grupo en su contexto.', items: ['Gestión de cursos y matrículas', 'Tareas con rúbrica y fecha límite', 'Ampliaciones individuales y recordatorios']},
 {icon: 'rubric', title: 'Criterios que dan claridad.', description: 'Construye rúbricas con ponderaciones y encuentra tus plantillas en una biblioteca para preparar la evaluación.', items: ['Creación y edición de rúbricas', 'Criterios y pesos personalizados', 'Biblioteca con búsqueda de plantillas']},
 {icon: 'review', title: 'IA con revisión docente.', description: 'Parte de una propuesta de evaluación y dedica tu atención a contrastar, ajustar y explicar el resultado.', items: ['Borrador a partir de la entrega y la rúbrica', 'Revisión de notas y observaciones', 'Publicación bajo control del docente']},
 {icon: 'document', title: 'Cada entrega, en su lugar.', description: 'El estudiante consulta la tarea, envía su documento y sigue su estado hasta recibir la evaluación publicada.', items: ['Carga de documentos DOCX', 'Estado e historial de entregas', 'Resultados y solicitudes de reevaluación']},
 {icon: 'chart', title: 'Resultados para actuar.', description: 'Consulta las calificaciones publicadas y reconoce dónde hace falta acompañar el aprendizaje.', items: ['Filtros por curso y periodo', 'Distribución de notas y desempeño', 'Historial de calificaciones y exportación CSV']},
 {icon: 'institution', title: 'Una institución organizada.', description: 'Coordina el acceso de la comunidad y da seguimiento a la operación desde las herramientas administrativas.', items: ['Aprobación e importación de usuarios', 'Asignación de cursos', 'Panel operativo y registro de auditoría']},
] as const;

type IconName = typeof features[number]['icon'] | 'bell' | 'shield' | 'guide' | 'settings';
function ProductIcon({name}: {name: IconName}) {
 const paths: Record<IconName, string> = {
  courses: 'M3 5h7l2 2 2-2h7v14h-7l-2 2-2-2H3V5Zm9 2v14',
  rubric: 'M8 4h13v16H3V9m5-5v5H3m8 2h7m-7 5h7M5 14l1 1 2-3',
  review: 'M14 3H5v18h14V10M9 8h3M9 12h3m-3 4h6m1-12 2-2 4 4-2 2-4-4Zm0 0-4 8 8-4',
  document: 'M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h5',
  chart: 'M4 3v17h17M8 16v-4m5 4V8m5 8V5',
  institution: 'M3 9h18L12 3 3 9Zm2 3v6m5-6v6m4-6v6m5-6v6M3 21h18',
  bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Zm5 3h4M12 2v2',
  shield: 'M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4Zm-4 9 3 3 5-6',
  guide: 'M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4V4Zm8 2v15M7 9h2m6 0h2M7 13h2m6 0h2',
  settings: 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6',
 };
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}

const roles = [
 {name: 'Docentes', subtitle: 'Más contexto para cada decisión.', icon: 'review', items: ['Cursos, matrículas y tareas', 'Rúbricas y biblioteca de plantillas', 'Revisión y publicación de evaluaciones', 'Gestión de reevaluaciones y ampliaciones', 'Seguimiento de entregas y recordatorios', 'Analíticas y exportación de calificaciones']},
 {name: 'Estudiantes', subtitle: 'Saber qué entregar y cómo mejorar.', icon: 'courses', items: ['Panel personal y cursos matriculados', 'Consulta de tareas, rúbricas y plazos', 'Envío de trabajos y seguimiento del estado', 'Historial de entregas', 'Notas y retroalimentación publicadas', 'Solicitud de revisión de una evaluación']},
 {name: 'Administración', subtitle: 'Tu comunidad, con acceso organizado.', icon: 'institution', items: ['Aprobación de solicitudes de registro', 'Importación de usuarios con plantilla Excel', 'Asignación de cursos', 'Seguimiento operativo de entregas y fallos', 'Gestión de comentarios y registro de auditoría', 'Gestión de instituciones para administradores de plataforma']},
] as const;
const essentials = [
 {icon: 'bell', title: 'Notificaciones a tu medida', text: 'Centro de avisos y preferencias de notificación. Avisos del navegador según permisos y compatibilidad.'},
 {icon: 'shield', title: 'Control de tu acceso', text: 'Autenticación de dos factores, códigos de recuperación y gestión de sesiones activas.'},
 {icon: 'guide', title: 'Acompañamiento desde el inicio', text: 'Guía de primeros pasos por rol, centro de ayuda y envío de preguntas, problemas o sugerencias.'},
 {icon: 'settings', title: 'Un espacio que se adapta', text: 'Perfil personal, configuración de la cuenta y apariencia clara, oscura o según tu sistema.'},
] as const;
const questionTitles = new Set([
 '¿Por qué mi cuenta está pendiente de aprobación?',
 '¿Qué formato y tamaño admite una entrega?',
 '¿Cuándo puede ver el estudiante la calificación?',
 '¿La IA garantiza una calificación correcta?',
]);
const questions = helpFaqs.filter(item => questionTitles.has(item.question));

export default function ProductFeatures() {
 return <>
  <section id="comunidad" className={styles.community} aria-labelledby="community-title">
   <div className={styles.sectionHeading}><p className={styles.kicker}>Una comunidad, distintos propósitos</p><h2 id="community-title">Tu próximo paso<br/>empieza aquí.</h2><p>Elige tu perfil y descubre cómo AuraGrade acompaña tu día a día.</p></div>
   <AudienceExplorer roles={roles} />
   <p className={styles.roleNote}>Tu institución gestiona la aprobación y los permisos de tu cuenta. Las funciones disponibles dependen de tu rol.</p>
  </section>
  <section id="funciones" className={styles.features} aria-labelledby="features-title">
   <div className={styles.featureHeading}><div className={styles.sectionHeading}><p className={styles.kicker}>Todo el recorrido académico</p><h2 id="features-title">De preparar una tarea<br/>a comprender el resultado.</h2></div><p>Reúne las herramientas que acompañan cada evaluación. Menos información dispersa, más continuidad para tu comunidad.</p></div>
   <div className={styles.featureGrid}>{features.map((feature, index) => <article key={feature.title} className={styles.featureCard}><div className={styles.featureTop}><span className={styles.featureIcon}><ProductIcon name={feature.icon}/></span><span className={styles.featureCategory}>{['Organización', 'Claridad', 'Acompañamiento', 'Seguimiento', 'Aprendizaje', 'Comunidad'][index]}</span></div><h3>{feature.title}</h3><p>{feature.description}</p><ul>{feature.items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></article>)}</div>
  </section>
  <section className={styles.essentials} aria-labelledby="essentials-title"><div className={styles.sectionHeading}><p className={styles.kicker}>También en tu día a día</p><h2 id="essentials-title">Los detalles que te acompañan.</h2></div><div className={styles.essentialGrid}>{essentials.map(item => <article key={item.title}><ProductIcon name={item.icon}/><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></section>

 </>;
}

export function HomeFaq() {
 return <section className={styles.faq} aria-labelledby="faq-title"><div className={styles.sectionHeading}><p className={styles.kicker}>Antes de comenzar</p><h2 id="faq-title">Resuelve tus primeras dudas.</h2><Link href="/help" className={styles.textLink}>Ver el centro de ayuda <span aria-hidden="true">↗</span></Link></div><div className={styles.faqList}>{questions.map(item => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>;
}
