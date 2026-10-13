import InformationLayout from '@/components/Information/InformationLayout';
import styles from '@/components/Information/information.module.css';
import {supportEmail} from '@/data/help';

const sections = [
  {
    "title": "Cuenta y acceso autorizado",
    "text": "Utiliza Aura Grade únicamente con una cuenta autorizada por tu institución y para las actividades educativas que te correspondan. Mantén privados tus datos de acceso y tus códigos de recuperación."
  },
  {
    "title": "Uso responsable de documentos",
    "text": "Comparte solo documentos que tengas autorización para utilizar. No intentes acceder a cuentas, cursos o entregas ajenas ni interferir con el funcionamiento del servicio."
  },
  {
    "title": "IA y revisión docente",
    "text": "Las evaluaciones de inteligencia artificial son propuestas que pueden contener errores. El docente revisa y publica la calificación; las consultas y solicitudes de reevaluación siguen el proceso académico de la institución."
  },
  {
    "title": "Plazos y funcionamiento",
    "text": "Los plazos y ampliaciones los gestiona el docente. La disponibilidad y el tiempo de procesamiento dependen también de servicios externos. Consulta el estado de tu entrega en la plataforma y reporta los errores a soporte."
  },
  {
    "title": "Reglas de tu institución",
    "text": "Estas condiciones describen el uso de la plataforma y se complementan con las reglas y acuerdos comunicados por tu institución. Para aclaraciones, escribe a soporte@auragrade.co."
  }
];

export default function InformationPage() {
 return <InformationLayout eyebrow="Un espacio académico compartido" title="Condiciones de uso" description="Una guía de las responsabilidades de estudiantes, docentes e instituciones al utilizar AuraGrade.">
  <div className={styles.grid}>
   <aside className={styles.sidebar}><nav aria-label="En esta página" className={styles.panel}><h2>En esta página</h2><div className={styles.categories}>{sections.map((section, index) => <a key={section.title} href={`#seccion-${index + 1}`}>{section.title}</a>)}</div></nav></aside>
   <article className={styles.panel}>
    <p className={styles.date}>Contenido actualizado el 10 de septiembre de 2026</p>
    {sections.map((section, index) => <section className={styles.section} id={`seccion-${index + 1}`} key={section.title}><h2>{index + 1}. {section.title}</h2><p>{section.text}</p></section>)}
    <div className={styles.notice}><strong>¿Necesitas una aclaración?</strong><p>Consulta con tu institución o contacta al equipo de soporte.</p><a className={styles.link} href={`mailto:${supportEmail}`}>{supportEmail}</a></div>
   </article>
  </div>
 </InformationLayout>;
}
