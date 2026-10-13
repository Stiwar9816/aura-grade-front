/** An explicit empty value disables indexing for private preview deployments. */
export function normalizeSiteOrigin(value?: string): string | undefined {
 if (!value) return undefined;
 try {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return undefined;
  return url.origin;
 } catch { return undefined; }
}
export const siteOrigin = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aura-grade-front.vercel.app');
export const publicPages: Record<string, {title: string; description: string; image: string; imageAlt: string}> = {
 '/': {image: '/seo/inicio.png', imageAlt: 'AuraGrade: cada nota, con fundamento. Rúbricas claras, IA de apoyo y revisión docente.', title: 'AuraGrade | Evaluación académica con rúbricas', description: 'Define rúbricas, revisa entregas y publica resultados con fundamento. AuraGrade apoya la evaluación con IA y mantiene la revisión en manos del docente.'},
 '/help': {image: '/seo/ayuda.png', imageAlt: 'Ayuda AuraGrade para cursos, entregas, evaluación y acceso a tu cuenta.', title: 'Ayuda y soporte | AuraGrade', description: 'Resuelve dudas sobre cursos, entregas, revisión docente, acceso a tu cuenta y soporte de AuraGrade.'},
 '/privacy': {image: '/seo/privacidad.png', imageAlt: 'Privacidad en AuraGrade: información sobre datos académicos, cuentas e instituciones.', title: 'Información sobre privacidad | AuraGrade', description: 'Conoce qué datos utiliza AuraGrade para gestionar cuentas, entregas y evaluaciones, y consulta las condiciones de tratamiento con tu institución.'},
 '/terms': {image: '/seo/condiciones.png', imageAlt: 'Condiciones de uso de AuraGrade para estudiantes, docentes e instituciones.', title: 'Condiciones de uso | AuraGrade', description: 'Consulta las condiciones de uso de AuraGrade y las responsabilidades de estudiantes, docentes e instituciones durante la evaluación académica.'},
};

/** Public information only; never expose account, course or submission URLs. */
export function buildSitemap(origin = siteOrigin) {
 return origin ? Object.entries(publicPages).map(([path, page]) => ({
  url: `${origin}${path}`,
  changeFrequency: 'monthly' as const,
  priority: path === '/' ? 1 : 0.5,
  images: [`${origin}${page.image}`],
 })) : [];
}
