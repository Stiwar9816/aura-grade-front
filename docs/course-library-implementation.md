# Biblioteca oficial: integración web

Implementación autorizada sobre dev en aura-grade-front; backend en aura-grade. Objetivo: completar la biblioteca del curso para docentes y estudiantes. La integración y la verificación posterior con Cloudinary real están completas en el entorno local de desarrollo.

## Diseño

Panel dentro de Cursos usando Card, SectionHeader y los controles actuales. Inter, azul institucional #2855AD, fondo #F5F7FB, texto gris y estados semánticos existentes; respetar el tema oscuro. Lista de documentos con detalle debajo para conservar el ancho en móvil. Separar registro de documento, subida de versión, revisión de texto y publicación. El estudiante solo consulta y descarga publicaciones. No mostrar controles administrativos a otros roles.

El BFF lee la cookie HttpOnly, comprueba origen en mutaciones, permite únicamente rutas de biblioteca con UUID y paginación acotada, conserva bytes multipart con límite y pasa Idempotency-Key. Descargas redirigen únicamente al host HTTPS de Cloudinary tras autorización. No exponer tokens ni secretos al navegador.

Al cambiar curso/documento/versión se desmonta el estado anterior; cancelar lecturas en curso y ocultar respuestas obsoletas. Reintentos de subida conservan su clave hasta recibir éxito o seleccionar otro archivo. Mostrar carga, vacío, error, falta de texto, borrador revisado, publicación y archivo. Publicar/retirar con confirmación; revisión vinculada al hash de la versión.

## Plan y progreso

- [x] Pruebas del BFF y cliente: autorización, multipart binario, límites, rutas, errores y descargas.
- [x] BFF REST y cliente tipado, sin dependencias nuevas.
- [x] Panel compartido de biblioteca, integración en Cursos docente/estudiante, pruebas de presentación y flujo.
- [x] Suite completa, seguridad, tipos, lint, build y comprobación visual con datos sintéticos; revisión independiente.
- [x] Verificar backend y crear commits locales en dev de ambos proyectos.
- [x] Aplicar las migraciones pendientes en desarrollo y verificar Cloudinary real, tras autorización posterior del usuario. Sin push ni despliegue.

## Validación del entorno

La inspección visual usó datos sintéticos. Después de los commits, el 2026-10-24 se aplicaron las migraciones en la base local `auraGradeDB` y se comprobaron las rutas HTTP del BFF contra el backend, PostgreSQL, Redis y Cloudinary reales. Esta comprobación posterior no repitió la inspección visual.

## Resultado (2026-10-24)

- Frontend: 33 pruebas funcionales (7 nuevas) y 8 de seguridad aprobadas; TypeScript, ESLint global, build de Next y comprobación de whitespace correctos. Sin dependencias nuevas.
- Backend: 591 pruebas aprobadas y una prueba Redis opt-in omitida; build y tipos correctos, lint de los 32 archivos TypeScript afectados correcto. Lint global conserva 98 errores de formato y 5 avisos en 13 archivos sin cambios, verificados contra HEAD; no se amplió esta tarea para reformatearlos.
- Navegador sobre compilación del frontend y backend sintético en memoria: login de docente/estudiante, subida multipart de PDF sintético, revisión con confirmación, publicación, retiro que conserva historial, creación de cronograma, lectura estudiantil solo de publicación vigente, curso vacío y cambio de curso sin contenido residual. No se prueba aquí la autorización real contra base de datos ni la descarga desde Cloudinary.
- Vistas inspeccionadas a 390 y 1280 píxeles, con tema claro/oscuro existente. La biblioteca no desborda su contenedor móvil (316 px de ancho visible y de contenido). Corregido contraste del selector de archivos oscuro utilizando el token institucional que ya tiene variante de tema.
- Revisión independiente detectó bloqueo de publicación separado del bloqueo de retiro. Reproducido en navegador retrasando `/publish`: antes el retiro seguía habilitado. Corregido compartiendo el bloqueo de `DocumentWorkspace`; repetida la prueba, retiro, actualización, selección de versiones y subida permanecen deshabilitados hasta completar la publicación. Esta regresión se verificó manualmente con respuesta controlada; las pruebas Node no simulan interacción DOM.
- El servidor de desarrollo preexistente del usuario se conserva. Los servidores temporales de verificación y sus datos sintéticos se retiran al terminar.

## Verificación real posterior (2026-10-24)

- Backend `e87d5369` y frontend `cd975f6` en dev. Migraciones `PreserveEvaluationReviewSnapshots1791806400000` y `AddCourseDocumentLibrary1792843200000` aplicadas en la base local; 30 migraciones aplicadas y ninguna pendiente.
- Actualizadas las dependencias del contenedor backend con `pnpm install --frozen-lockfile` y reiniciado solo ese servicio: faltaba `pdf-parse` y el proceso anterior todavía no exponía las rutas nuevas. Backend `/api/health`: 200. Frontend existente conservado en puerto 3001.
- Cuentas, institución y curso temporales; sesiones obtenidas por contraseña y OTP reales. La biblioteca se ejercitó por el BFF con cookie de sesión y origen válido, sin desactivar guards.
- PDF y DOCX: subida privada, extracción, revisión por hash, publicación y descarga exacta de bytes comprobadas. Repetir la subida PDF con la misma clave no duplicó la versión. Publicar DOCX archivó la primera versión; retirar la publicación conservó el historial.
- Acceso: sin sesión 401; borrador estudiantil 404; publicar sin revisión 400; estudiante desmatriculado 403; estudiante desactivado con sesión existente 401. Volver a matricular restauró el acceso antes de probar la baja.
- Descarga: BFF 302 a Cloudinary y `no-store`; original sin firma 401; enlace vencido 401. También se esperó el vencimiento real del enlace de 60 segundos y se comprobó su rechazo sin regenerarlo.
- Eliminados registros y sesiones temporales. La cuenta Cloudinary conservaba respaldos tras borrar originales; se retiraron exclusivamente los respaldos de los dos archivos de prueba y se verificó que ambos recursos devolvían 404. No se alteró la política general de respaldo.
- Evidencia detallada en el backend: `docs/verification/2026-10-24-course-library-live.md`. No se llamaron modelos de IA ni se enviaron correos. Institución inactiva y estados de aprobación mantienen cobertura automatizada; no se repitieron en esta prueba real.

## Siguiente etapa

1. Vincular actividades y calendario con las versiones oficiales de guía y cronograma.
2. Continuar con recuperación RAG autorizada y después Telegram; aún no están implementados.
3. Aplicar el procedimiento de migración y validación correspondiente cuando se despliegue en otro entorno. Esta verificación fue local, no de producción.

## Vista previa desde el icono de ojo

El botón «Vista previa», junto a «Descargar original», abre un diálogo accesible para docentes y estudiantes. PDF muestra el original en el lector integrado del navegador; DOCX muestra el texto extraído e indica que formato, tablas e imágenes se consultan descargando el original. Los navegadores sin lector PDF integrado conservan esa alternativa.

Al abrir se vuelve a autorizar: DOCX consulta el detalle; PDF usa `GET .../versions/:versionId/preview` en el BFF, que solicita al backend una descarga autorizada. El BFF obtiene el archivo exclusivamente desde HTTPS `api.cloudinary.com`, sin redirecciones ni credenciales de sesión hacia el proveedor, limita a 15 MiB y comprueba la cabecera PDF. Devuelve bytes inline y `no-store`. El navegador crea una URL de objeto temporal que revoca al cerrar; cancela las solicitudes pendientes. La vista se desmonta al cambiar documento o versión.

Validación: 35 pruebas funcionales y 8 de seguridad aprobadas; tipos y lint de archivos afectados correctos. Dos pruebas nuevas comprueban bytes PDF, autorización, destinos externos, tamaño y rechazo de contenido que no sea PDF. Verificación visual con documentos sintéticos en servidor aislado: PDF renderizado por Edge, DOCX, tema claro/oscuro, error de acceso y recuperación del foco al cerrar con botón o Escape. El navegador integrado de Codex no renderizó el PDF; Edge sí. No se certifica aquí una nueva carga a Cloudinary ni la vista móvil.
