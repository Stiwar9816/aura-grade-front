# Consultas académicas privadas

Rutas BFF preparadas para consumidores futuros del asistente; no añade todavía interfaz conversacional ni Telegram.

- `GET /api/courses/:courseId/academic-queries/activities?page=1&limit=20&upcoming=true`
- `GET /api/courses/:courseId/academic-queries/activities/:assignmentId/result`

El BFF usa exclusivamente la cookie de sesión, limita rutas/filtros y reenvía a la API mediante el helper existente. No acepta studentId, cuerpo de consulta ni métodos de escritura. Respuestas sin caché; limpia la sesión en 401. El backend vuelve a comprobar estado académico/matrícula y devuelve solo actividad activa, prórroga/entrega propia y evaluación publicada.

Validación del 28 de octubre: 3 pruebas nuevas de BFF (fallaron antes de existir el handler, luego pasaron), 48 tests totales incluidos los de seguridad, TypeScript, ESLint de archivos nuevos y build Next.js. El recorrido visual completo y login/OTP no se repitieron aquí. La integración backend de HTTP/PostgreSQL/Redis y la preparación del curso están documentadas en `aura-grade/docs/verification/2026-10-28-vector-and-course-pilot.md`.
