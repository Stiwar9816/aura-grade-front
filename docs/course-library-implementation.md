# Biblioteca oficial: integración web

Implementación autorizada sobre dev en aura-grade-front; backend en aura-grade. Objetivo: completar la biblioteca del curso para docentes y estudiantes antes de migrar y validar Cloudinary real.

## Diseño

Panel dentro de Cursos usando Card, SectionHeader y los controles actuales. Inter, azul institucional #2855AD, fondo #F5F7FB, texto gris y estados semánticos existentes; respetar el tema oscuro. Lista de documentos con detalle debajo para conservar el ancho en móvil. Separar registro de documento, subida de versión, revisión de texto y publicación. El estudiante solo consulta y descarga publicaciones. No mostrar controles administrativos a otros roles.

El BFF lee la cookie HttpOnly, comprueba origen en mutaciones, permite únicamente rutas de biblioteca con UUID y paginación acotada, conserva bytes multipart con límite y pasa Idempotency-Key. Descargas redirigen únicamente al host HTTPS de Cloudinary tras autorización. No exponer tokens ni secretos al navegador.

Al cambiar curso/documento/versión se desmonta el estado anterior; cancelar lecturas en curso y ocultar respuestas obsoletas. Reintentos de subida conservan su clave hasta recibir éxito o seleccionar otro archivo. Mostrar carga, vacío, error, falta de texto, borrador revisado, publicación y archivo. Publicar/retirar con confirmación; revisión vinculada al hash de la versión.

## Plan y progreso

- [x] Pruebas del BFF y cliente: autorización, multipart binario, límites, rutas, errores y descargas.
- [x] BFF REST y cliente tipado, sin dependencias nuevas.
- [x] Panel compartido de biblioteca, integración en Cursos docente/estudiante, pruebas de presentación y flujo.
- [x] Suite completa, seguridad, tipos, lint, build y comprobación visual con datos sintéticos; revisión independiente.
- [x] Verificar backend y preparar cambios para commits locales en dev de ambos proyectos. No aplicar migración, usar Cloudinary real ni hacer push.

## Validación pendiente del entorno

Las pruebas de interfaz usarán datos sintéticos claramente separados de producción. La migración y la carga/descarga con Cloudinary real se realizarán después de estos commits, como solicitó el usuario.

## Resultado (2026-10-24)

- Frontend: 33 pruebas funcionales (7 nuevas) y 8 de seguridad aprobadas; TypeScript, ESLint global, build de Next y comprobación de whitespace correctos. Sin dependencias nuevas.
- Backend: 591 pruebas aprobadas y una prueba Redis opt-in omitida; build y tipos correctos, lint de los 32 archivos TypeScript afectados correcto. Lint global conserva 98 errores de formato y 5 avisos en 13 archivos sin cambios, verificados contra HEAD; no se amplió esta tarea para reformatearlos.
- Navegador sobre compilación del frontend y backend sintético en memoria: login de docente/estudiante, subida multipart de PDF sintético, revisión con confirmación, publicación, retiro que conserva historial, creación de cronograma, lectura estudiantil solo de publicación vigente, curso vacío y cambio de curso sin contenido residual. No se prueba aquí la autorización real contra base de datos ni la descarga desde Cloudinary.
- Vistas inspeccionadas a 390 y 1280 píxeles, con tema claro/oscuro existente. La biblioteca no desborda su contenedor móvil (316 px de ancho visible y de contenido). Corregido contraste del selector de archivos oscuro utilizando el token institucional que ya tiene variante de tema.
- Revisión independiente detectó bloqueo de publicación separado del bloqueo de retiro. Reproducido en navegador retrasando `/publish`: antes el retiro seguía habilitado. Corregido compartiendo el bloqueo de `DocumentWorkspace`; repetida la prueba, retiro, actualización, selección de versiones y subida permanecen deshabilitados hasta completar la publicación. Esta regresión se verificó manualmente con respuesta controlada; las pruebas Node no simulan interacción DOM.
- El servidor de desarrollo preexistente del usuario se conserva. Los servidores temporales de verificación y sus datos sintéticos se retiran al terminar.

## Siguiente etapa operativa

1. Revisar/aplicar la migración `1792843200000-AddCourseDocumentLibrary` en el entorno destino con su procedimiento habitual.
2. Conectar este frontend al backend migrado y confirmar carga privada PDF/DOCX, revisión, publicación y descarga con Cloudinary real.
3. Verificar con cuentas de prueba reales el bloqueo por baja, institución inactiva o matrícula retirada, además del vencimiento de enlaces de descarga.
4. Continuar con la preparación de actividades y calendario; el RAG y Telegram aún no forman parte de esta entrega.
