import {ImageResponse} from 'next/og.js';
import {createElement as h} from 'react';
import {readFile, mkdir, writeFile} from 'node:fs/promises';

const logo = `data:image/png;base64,${(await readFile(new URL('../public/logo.png', import.meta.url))).toString('base64')}`;
const cards = [
 ['inicio', 'EVALUACIÓN ACADÉMICA', 'Cada nota,\ncon fundamento.', 'Rúbricas claras. IA de apoyo.\nLa decisión en manos del docente.', ['Define criterios', 'Revisa evidencias', 'Publica resultados']],
 ['ayuda', 'AYUDA Y SOPORTE', 'Tu próximo paso,\nmás claro.', 'Orientación para estudiantes,\ndocentes e instituciones.', ['Cursos y entregas', 'Evaluación y revisión', 'Cuenta y soporte']],
 ['privacidad', 'INFORMACIÓN SOBRE PRIVACIDAD', 'Conoce cómo se\nusan tus datos.', 'Información sobre cuentas,\nentregas y evaluaciones.', ['Datos académicos', 'Acceso a tu cuenta', 'Tu institución']],
 ['condiciones', 'CONDICIONES DE USO', 'Un espacio con\nreglas claras.', 'Responsabilidades compartidas\nen la evaluación académica.', ['Estudiantes', 'Docentes', 'Instituciones']],
];
await mkdir(new URL('../public/seo/', import.meta.url), {recursive: true});
for (const [slug, label, headline, subtitle, steps] of cards) {
 const tree = h('div', {style: {display:'flex', width:'100%', height:'100%', background:'#f5f7fb', color:'#192f58', fontFamily:'sans-serif', position:'relative', padding:'48px 64px'}},
  h('div', {style:{display:'flex', position:'absolute', width:610, height:610, right:-100, top:30, borderRadius:999, background:'linear-gradient(135deg, #dce8fa, #e8e1f6)', border:'1px solid #c6d4ee'}}),
  h('div', {style:{display:'flex', flexDirection:'column', width:730}},
   h('img', {src:logo, width:235, height:94, alt:'AuraGrade'}),
   h('div', {style:{fontSize:15, letterSpacing:2, color:'#2855ad', marginTop:30}}, label),
   h('div', {style:{fontSize:64, fontWeight:700, lineHeight:1.08, whiteSpace:'pre', marginTop:20, letterSpacing:-2}}, headline),
   h('div', {style:{fontSize:25, lineHeight:1.45, whiteSpace:'pre', color:'#526079', marginTop:24}}, subtitle),
   h('div', {style:{fontSize:17, color:'#526079', marginTop:'auto'}}, 'Estudiantes · Docentes · Instituciones')),
  h('div', {style:{display:'flex', position:'absolute', flexDirection:'column', top:196, right:52, width:340, gap:18}},
   ...steps.map((step, index) => h('div', {key:step, style:{display:'flex', alignItems:'center', gap:16, background:'#ffffff', border:'1px solid #dce3ef', borderRadius:18, padding:'25px 22px', boxShadow:'0 10px 25px #192f5810'}},
    h('div', {style:{display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:12, background:index===1?'#f0eaf7':'#eef3fc', color:index===1?'#65509a':'#2855ad', fontSize:18}}, `0${index+1}`),
    h('div', {style:{fontSize:21}}, step)))));
 const response = new ImageResponse(tree, {width:1200, height:630});
 const bytes = Buffer.from(await response.arrayBuffer());
 await writeFile(new URL(`../public/seo/${slug}.png`, import.meta.url), bytes);
 console.log(`${slug}.png: ${bytes.length} bytes (1200 × 630)`);
}
