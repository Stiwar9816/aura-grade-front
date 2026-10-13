import {useState} from 'react';
import InformationLayout from '@/components/Information/InformationLayout';
import styles from '@/components/Information/information.module.css';
import {helpCategories, helpFaqs, supportEmail} from '@/data/help';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function HelpPage() {
 const [category, setCategory] = useState<string>('general');
 const [query, setQuery] = useState('');
 const search = normalize(query);
 const results = helpFaqs.filter(faq => search ? normalize(`${faq.question} ${faq.answer}`).includes(search) : faq.category === category);
 return <InformationLayout eyebrow="Centro de ayuda" title="Encuentra tu próximo paso." description="Resuelve tus dudas sobre acceso, entregas y evaluación. Un punto de apoyo para estudiantes, docentes y administradores.">
  <div className={styles.search}>
   <label htmlFor="help-search">¿En qué podemos ayudarte?</label>
   <input id="help-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Busca contraseña, DOCX o calificación" aria-controls="help-results" />
  </div>
  <div className={styles.grid}>
   <aside className={styles.sidebar}>
    <nav aria-label="Categorías de ayuda" className={styles.categories}>{helpCategories.map(item => <button key={item.id} type="button" aria-pressed={!search && category === item.id} aria-controls="help-results" onClick={() => {setCategory(item.id); setQuery('');}}>{item.name}<span aria-label={`${helpFaqs.filter(faq => faq.category === item.id).length} preguntas`}>{helpFaqs.filter(faq => faq.category === item.id).length}</span></button>)}</nav>

   </aside>
   <div className={styles.stack}>
    <section className={styles.panel} id="help-results" aria-labelledby="results-title">
     <h2 id="results-title">{search ? 'Resultados de búsqueda' : helpCategories.find(item => item.id === category)?.name}</h2>
     <p role="status" className={styles.count}>{results.length} {results.length === 1 ? 'pregunta' : 'preguntas'}{search ? ' en todas las categorías' : ' para orientarte'}</p>
     <div key={search || category}>{results.map(faq => <details key={faq.question} className={styles.faq}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
     {!results.length && <div><p>No encontramos resultados para «{query}». Prueba otra palabra o consulta las categorías.</p><button className={styles.link} type="button" onClick={() => setQuery('')}>Limpiar búsqueda</button></div>}
    </section>
    <section className={styles.panel} aria-labelledby="report-title"><p className={styles.eyebrow}>Soporte técnico</p><h2 id="report-title">Cuéntanos qué ocurrió.</h2><p className={styles.count}>Estos detalles nos ayudan a entender tu consulta.</p>
     <ol className={styles.steps}><li>Indica tu institución, tu rol y la pantalla donde ocurrió.</li><li>Describe los pasos, qué esperabas y qué ocurrió, con fecha, hora y navegador.</li><li>Incluye el identificador de la tarea o entrega y el mensaje de error. Oculta datos personales de otras personas en las capturas.</li></ol>
     <p className={styles.notice}>Soporte nunca necesita tu contraseña, códigos del autenticador, códigos de recuperación ni el enlace para restablecer tu contraseña.</p>
    </section>
    <div className={styles.panel}><h2>Hablemos.</h2><p>Para problemas de acceso o funcionamiento, contacta a soporte.</p><a className={styles.link} href={`mailto:${supportEmail}?subject=Ayuda%20con%20AuraGrade`}>{supportEmail}</a><p className={styles.notice}>Para consultas sobre notas o plazos, acude a tu docente.</p></div>
   </div>
  </div>
 </InformationLayout>;
}
