# Asistente del curso

Panel plegable en cursos del docente/estudiante. Docente prepara cada publicación por lotes; estudiante pregunta sobre documentos y abre fuentes con versión/página. Próximas entregas y resultados consumen endpoints académicos privados, sin llamar IA. Cerrar/cambiar modo/curso cancela solicitudes y desmonta datos; no se persiste historial en navegador.

El BFF `courseAssistantProxy.ts` usa la sesión existente, no acepta identidad del cliente, valida rutas/métodos/origen/tamaño y fuerza no-store. Solo variables de servidor del BFF existente; ninguna clave de Gemini en frontend. Configurar el backend conforme a `src/course-assistant/README.md` del repositorio aura-grade.

Pruebas: `node --test scripts/course-assistant.test.mjs`; suite habitual, TypeScript y build Webpack. El panel conserva estilos del sitio; el botón ojo abre el visor autorizado de biblioteca. Preparación parcial se puede retomar sin repetir fragmentos ya guardados.
