"use client";

import {useState} from 'react';
import Link from 'next/link';
import styles from '@/app/home.module.css';

type Audience = {name: string; subtitle: string; items: readonly string[]};
const stories = [
 {title: 'Más espacio para enseñar.', text: 'Prepara tus tareas, revisa con contexto y convierte cada nota en una orientación útil.', label: 'Tu recorrido docente', steps: ['Preparar', 'Revisar', 'Publicar'], rows: ['Rúbricas con criterios y pesos', 'Borrador de IA para contrastar', 'Retroalimentación para compartir'], cta: 'Quiero enseñar con AuraGrade'},
 {title: 'Cada entrega, una oportunidad.', text: 'Conoce qué se espera de ti, sigue tu trabajo y entiende cómo avanzar a partir de la retroalimentación.', label: 'Tu recorrido como estudiante', steps: ['Consultar', 'Entregar', 'Aprender'], rows: ['La rúbrica antes de entregar', 'Tu documento y su estado', 'Observaciones para mejorar'], cta: 'Quiero aprender con AuraGrade'},
 {title: 'Una comunidad mejor conectada.', text: 'Organiza los accesos y los cursos, acompaña la operación y conserva el registro de las acciones.', label: 'Tu recorrido institucional', steps: ['Organizar', 'Acompañar', 'Supervisar'], rows: ['Usuarios y permisos por rol', 'Cursos y comunidad académica', 'Operaciones y auditoría'], cta: 'Quiero conocer el acceso institucional'},
];
const icons = [
 'M3 5h7l2 2 2-2h7v14h-7l-2 2-2-2H3V5Zm9 2v14',
 'm2 9 10-5 10 5-10 5L2 9Zm4 3v6c4 3 8 3 12 0v-6m4-3v8',
 'M3 9h18L12 3 3 9Zm2 3v6m5-6v6m4-6v6m5-6v6M3 21h18',
];

export default function AudienceExplorer({roles}: {roles: readonly Audience[]}) {
 const [selected, setSelected] = useState(0);
 const role = roles[selected];
 const story = stories[selected];
 return <div className={styles.audienceExplorer}>
  <div className={styles.audiencePicker} role="group" aria-label="Explorar funciones por perfil">{roles.map((item, index) => <button key={item.name} type="button" aria-pressed={selected === index} aria-controls="audience-detail" onClick={() => setSelected(index)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[index]}/></svg>{item.name}<span aria-hidden="true">↗</span></button>)}</div>
  <div id="audience-detail" className={styles.audienceDetail}>
   <div className={styles.audienceCopy}><p className={styles.kicker}>{role.name}</p><h3 aria-live="polite" aria-atomic="true">{story.title}</h3><p>{story.text}</p><ul>{role.items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul><Link href="/register" className="btn-primary">{story.cta}<span aria-hidden="true">↗</span></Link></div>
   <div className={styles.journeyVisual} aria-label={story.label}><div className={styles.journeyOrbit} aria-hidden="true"/><div className={styles.journeyBadge}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[selected]}/></svg></div><p>{story.label}</p><ol>{story.rows.map((row, index) => <li key={row}><span>0{index + 1}</span><div><strong>{story.steps[index]}</strong><p>{row}</p></div><span aria-hidden="true">✓</span></li>)}</ol><small>Herramientas conectadas en un mismo espacio.</small></div>
  </div>
 </div>;
}
