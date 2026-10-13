import InformationLayout from '@/components/Information/InformationLayout';
import styles from '@/components/Information/information.module.css';
import {supportEmail} from '@/data/help';

const sections = [
  {
    "title": "Datos utilizados y acceso",
    "text": "La plataforma utiliza tus datos de cuenta, institución, cursos, entregas y evaluaciones para prestar el servicio educativo. Los permisos dependen de tu rol y de tu relación con la actividad."
  },
  {
    "title": "Servicios que intervienen",
    "text": "Los documentos se almacenan mediante Cloudinary. El texto extraído y la rúbrica se envían al proveedor de inteligencia artificial configurado por el servicio (OpenAI o Google Gemini) para generar el borrador de evaluación. Los correos se entregan mediante Resend. La configuración puede incluir Sentry para diagnóstico técnico de errores."
  },
  {
    "title": "Documentos que compartes",
    "text": "No incluyas datos sensibles o de terceros que no sean necesarios para la actividad. Consulta con tu institución qué documentos puedes compartir y qué condiciones de tratamiento y conservación aplican a tu cuenta."
  },
  {
    "title": "Sesión y preferencias",
    "text": "Las cookies de sesión permiten mantener el acceso. Las preferencias de visualización pueden guardarse en el navegador; las preferencias de notificaciones se asocian a tu cuenta."
  },
  {
    "title": "Consultas sobre tus datos",
    "text": "Para consultar, corregir o solicitar la eliminación de tus datos, contacta a tu institución y a soporte@auragrade.co. La solicitud requiere verificar tu identidad y revisar las obligaciones de conservación del historial académico. No existe un botón de borrado inmediato de toda la cuenta."
  }
];

export default function InformationPage() {
 return <InformationLayout eyebrow="Tus datos y tu información" title="Información sobre privacidad" description="Conoce qué información utiliza AuraGrade, cómo intervienen los servicios de apoyo y dónde consultar sobre tus datos.">
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
