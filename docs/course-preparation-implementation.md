# Preparación del curso — 2026-10-28

En Cursos, debajo de Biblioteca, el panel «Actividades y cronograma» lista las tareas por su fecha general. Docentes abren Revisar, cotejan instrucciones/rúbrica y los originales publicados, indican sección de guía y cronograma, y confirman coherencia. Al confirmar el panel vuelve a la lista compacta. Estudiantes ven su fecha efectiva (prórroga personal cuando existe) y los documentos aún vigentes.

Las actividades existentes no se modifican ni pierden visibilidad. La falta de fuentes publicadas impide confirmar; cambios de instrucciones, fecha, rúbrica o publicación vuelven la confirmación pendiente. Las fechas se muestran en America/Bogota. Las secciones son referencias manuales; no se garantiza desplazamiento del visor a la página indicada.

Contrato nuevo bajo el BFF existente: GET documents/preparation y POST documents/preparation/:assignmentId/confirm. El servidor revalida curso, propietario, acceso académico, versiones publicadas y huella de actividad/rúbrica. El estudiante nunca recibe la huella ni prórrogas ajenas. Sin dependencias nuevas.

La biblioteca emite course-library-changed tras mutaciones exitosas para refrescar el panel del mismo curso; también hay actualización manual. No refrescar por focus: regresar de descargar un original debe conservar la revisión en curso. Cambiar curso desmonta el estado previo.

Validación: 37 pruebas frontend; TypeScript y ESLint enfocado correctos. Comprobación visual con componentes reales, Strict Mode y API sintética: ambos roles, confirmación, prórroga, visor DOCX, retiro de fuente, tema claro/oscuro y contenedor de 390 px. El backend se verificó por separado contra PostgreSQL real con rollback; no se declara sesión E2E real ni nueva prueba de Cloudinary en esta entrega.

Requiere la migración backend AddCourseActivityConfirmations1793188800000. Primer incremento de etapa 3; IA de actividades, RAG y Telegram pendientes.

Activación local: migración aplicada en auraGradeDB y backend reiniciado con health OK. Build Next.js correcto; sin push ni despliegue.
