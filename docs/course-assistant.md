# Asistente del curso

Panel plegable en cursos del docente/estudiante. Docente prepara cada publicación por lotes; estudiante pregunta sobre documentos y abre fuentes con versión/página. Próximas entregas y resultados consumen endpoints académicos privados, sin llamar IA. Cerrar/cambiar modo/curso cancela solicitudes y desmonta datos; no se persiste historial en navegador.

El BFF `courseAssistantProxy.ts` usa la sesión existente, no acepta identidad del cliente, valida rutas/métodos/origen/tamaño y fuerza no-store. Solo variables de servidor del BFF existente; ninguna clave de Gemini en frontend. Configurar el backend conforme a `src/course-assistant/README.md` del repositorio aura-grade.

Pruebas: `node --test scripts/course-assistant.test.mjs`; suite habitual, TypeScript y build Webpack. El panel conserva estilos del sitio; el botón ojo abre el visor autorizado de biblioteca. Preparación parcial se puede retomar sin repetir fragmentos ya guardados.

## Telegram

Los estudiantes vinculan Telegram desde Ajustes (`src/components/Telegram/TelegramLink.tsx`). Las rutas BFF `/api/telegram/link` (GET/DELETE) y `/api/telegram/link/token` (POST) usan la sesión existente y no aceptan identidad del cliente; el código de un solo uso solo vive en el estado del componente. La tarjeta se oculta si el backend no tiene Telegram habilitado. Ver `src/telegram/README.md` en aura-grade. Prueba: `node --test scripts/telegram-link.test.mjs`.
