/** Canonicals are enabled only when the deployment supplies its actual public origin. */
export function normalizeSiteOrigin(value?: string): string | undefined {
 if (!value) return undefined;
 try {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return undefined;
  return url.origin;
 } catch { return undefined; }
}
export const siteOrigin = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
export const publicPages: Record<string, {title: string; description: string}> = {
 '/': {title: 'AuraGrade | Evaluación académica con rúbricas', description: 'Define rúbricas, revisa entregas y publica resultados con fundamento. AuraGrade apoya la evaluación con IA y mantiene la revisión en manos del docente.'},
 '/help': {title: 'Ayuda y soporte | AuraGrade', description: 'Resuelve dudas sobre cursos, entregas, revisión docente, acceso a tu cuenta y soporte de AuraGrade.'},
 '/privacy': {title: 'Información sobre privacidad | AuraGrade', description: 'Conoce qué datos utiliza AuraGrade para gestionar cuentas, entregas y evaluaciones, y consulta las condiciones de tratamiento con tu institución.'},
 '/terms': {title: 'Condiciones de uso | AuraGrade', description: 'Consulta las condiciones de uso de AuraGrade y las responsabilidades de estudiantes, docentes e instituciones durante la evaluación académica.'},
};
