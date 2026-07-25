<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://res.cloudinary.com/dwtf5ftav/image/upload/v1778560040/1_ujpdg5.png" width="500" alt="AuraGrade Logo" /></a>
</p>

# 🚀Aura Grade - (Clasificación asistida por IA)

Una plataforma progresiva para la gestión educativa eficiente y escalable, potenciada por IA. Diseñada para agilizar el proceso de evaluación y proporcionar información profunda sobre el rendimiento de los estudiantes.

## 🌟 Propósito Principal

Aura Grade tiene como objetivo cerrar la brecha entre la evaluación tradicional y la tecnología moderna. Aprovechando las capacidades de la IA, la plataforma ayuda a los educadores a proporcionar retroalimentación más rápida, objetiva y altamente detallada a los estudiantes, al mismo tiempo que ofrece una experiencia de gestión fluida.

## ✨ Características Clave

### 👨‍🏫 Para Profesores

- **Calificación Potenciada por IA**: Analiza y sugiere puntajes automáticamente basados en rúbricas personalizadas.
- **Constructor de Rúbricas**: Crea y gestiona criterios de evaluación complejos con facilidad.
- **Análisis de Rendimiento**: Visualiza tendencias de la clase, distribución de calificaciones y el progreso individual de los estudiantes mediante mapas de calor y gráficos.
- **Evaluación en Pantalla Dividida**: Revisa las entregas de manera eficiente junto con las herramientas de evaluación.
- **Gestión Avanzada de Tareas**: Vista detallada para cada tarea, con seguimiento de entregas y flujos de evaluación mejorados.
- **Historial de Calificaciones y Reportes**: Visualiza una lista exhaustiva de las entregas evaluadas, filtradas por estudiante, curso o tarea. Permite la exportación de datos a formato CSV/Excel para reportes.

### 🎓 Para Estudiantes

- **Cargas Inteligentes**: Proceso de entrega por pasos con retroalimentación en tiempo real.
- **Retroalimentación Perspicaz**: Accede a sugerencias detalladas generadas por IA y comentarios de los profesores.
- **Seguimiento del Progreso**: Monitorea el crecimiento académico a través de tableros de control intuitivos.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Componentes de UI**: Componentes estéticos personalizados con accesibilidad tipo Radix.
- **Gestión de Estado y Datos**: [Apollo Client](https://www.apollographql.com/docs/react/) para la integración con GraphQL.

## ⚙️ Configuración del Entorno

Asegúrate de crear un archivo `.env.local` basado en `.env.example` (si existe) o incluir la siguiente variable para la conexión con la API:

```bash
AURA_GRADE_API_URL=http://localhost:3000 # Origen privado del backend
AURA_GRADE_BFF_SECRET=un-secreto-compartido-de-al-menos-32-caracteres
SESSION_COOKIE_NAME=ag_session
```

Estas variables son exclusivamente de servidor y nunca deben usar el prefijo
`NEXT_PUBLIC_`. `AURA_GRADE_BFF_SECRET` debe coincidir con
`BFF_SHARED_SECRET` del backend.

## 🚀 Cómo Empezar

Primero, instala las dependencias:

```bash
pnpm install
# o
npm install
```

Luego, ejecuta el servidor de desarrollo:

```bash
pnpm dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## 👤 Autor

### **Stiwar Asprilla**

Redes Sociales:

- GitHub: [@Stiwar9816](https://github.com/Stiwar9816)
- Docker Hub: [stiwar1098](https://hub.docker.com/u/stiwar1098)
- LinkedIn: [Stiwar Asprilla](https://www.linkedin.com/in/stiwar-asprilla/)

---

<p align="center">Hecho con ❤️ y ☕ para AuraGrade</p>
