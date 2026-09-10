export const helpCategories = [
	{ id: "general", name: "Primeros pasos" },
	{ id: "submissions", name: "Entregas" },
	{ id: "grading", name: "Evaluación e IA" },
	{ id: "account", name: "Acceso y seguridad" },
	{ id: "notifications", name: "Notificaciones" },
] as const;
export const helpFaqs = [
	{
		category: "general",
		question: "¿Qué puedo hacer en Aura Grade?",
		answer:
			"Los docentes organizan cursos, publican tareas con rúbricas y revisan las evaluaciones asistidas por IA. Los estudiantes consultan sus tareas, envían documentos y revisan la retroalimentación que publica el docente.",
	},
	{
		category: "general",
		question: "¿Por qué mi cuenta está pendiente de aprobación?",
		answer:
			"El registro institucional puede requerir aprobación del administrador. Una cuenta pendiente no puede entrar al sistema hasta completar ese proceso. Contacta a tu institución si tus datos necesitan una corrección.",
	},
	{
		category: "general",
		question: "¿Cómo me matriculo en un curso?",
		answer:
			"El docente o la administración gestiona la matrícula. Si un curso no aparece, confirma con tu institución que estás matriculado y que tu cuenta pertenece a la institución correcta.",
	},
	{
		category: "general",
		question: "¿Quién puede cambiar mi rol o mis datos institucionales?",
		answer:
			"Solicita la revisión a la administración de tu institución. El rol determina las funciones disponibles y no puede cambiarse libremente desde el registro o el perfil.",
	},
	{
		category: "submissions",
		question: "¿Qué formato y tamaño admite una entrega?",
		answer:
			"Solo se aceptan archivos DOCX de hasta 15 MB. El documento debe contener texto extraíble y no superar 100.000 caracteres. No se admiten PDF, TXT, documentos cifrados ni archivos dañados. Las imágenes y los documentos escaneados no se transcriben con OCR.",
	},
	{
		category: "submissions",
		question: "¿Qué reviso antes de subir mi trabajo?",
		answer:
			"Selecciona el curso y la tarea correctos, revisa su rúbrica y la fecha límite, y comprueba que el DOCX contiene el texto de tu trabajo. Evita incluir datos personales que no sean necesarios para la actividad.",
	},
	{
		category: "submissions",
		question: "¿Puedo enviar otra versión?",
		answer:
			"Puedes crear otra entrega mientras la tarea esté activa, dentro de tu plazo y mientras no exista una evaluación publicada para ti en esa tarea. Cada entrega conserva su historial; no reemplaza silenciosamente la anterior.",
	},
	{
		category: "submissions",
		question: "¿Qué ocurre si vence el plazo?",
		answer:
			"El servidor comprueba el plazo al recibir la entrega. Si necesitas más tiempo, solicita una ampliación al docente. Una ampliación individual cambia tu fecha efectiva; una solicitud de ampliación no equivale a su aprobación.",
	},
	{
		category: "submissions",
		question: "¿Qué hago si el envío se interrumpe?",
		answer:
			"Consulta primero Mis entregas. Si ya aparece, no necesitas volver a subirlo. Si sigue fallando, conserva el mensaje de error y reporta la tarea, la hora y el navegador. No envíes tu documento completo por correo salvo que soporte lo solicite y puedas compartirlo.",
	},
	{
		category: "submissions",
		question: "¿Quién puede descargar un documento?",
		answer:
			"La descarga requiere una sesión vigente y permisos sobre la entrega. Si el sistema indica que un archivo requiere migración, contacta a soporte con el identificador de la entrega.",
	},
	{
		category: "grading",
		question: "¿Cuándo puede ver el estudiante la calificación?",
		answer:
			"La evaluación automática genera un borrador para revisión docente. El estudiante ve la calificación y la retroalimentación cuando el docente las publica.",
	},
	{
		category: "grading",
		question: "¿La IA garantiza una calificación correcta?",
		answer:
			"La IA puede omitir información o interpretar mal el texto y la rúbrica. El docente debe revisar el resultado antes de publicarlo. No ofrecemos un porcentaje de precisión garantizado ni una duración fija de evaluación.",
	},
	{
		category: "grading",
		question: "¿Por qué una evaluación está pendiente o fallida?",
		answer:
			"El procesamiento depende de la cola, el documento y la disponibilidad del proveedor de IA. Los errores transitorios tienen reintentos automáticos. Si una entrega termina en estado fallido, el docente puede solicitar un reintento. Si ya existe una evaluación, corresponde revisarla.",
	},
	{
		category: "grading",
		question: "¿Cómo solicito una revisión de mi nota?",
		answer:
			"Abre la evaluación publicada y utiliza la solicitud de reevaluación con una explicación concreta de los criterios que deseas revisar. El docente gestiona la solicitud y su respuesta. Para dudas sobre una rúbrica o decisión académica, contacta primero a tu docente.",
	},
	{
		category: "grading",
		question: "¿Puede cambiar la rúbrica después de recibir entregas?",
		answer:
			"Cuando una tarea ya tiene entregas, no se puede cambiar su curso ni su rúbrica ni eliminar la tarea. El docente puede desactivarla para conservar el historial o crear una tarea nueva con otros criterios.",
	},
	{
		category: "account",
		question: "¿Cómo recupero mi contraseña?",
		answer:
			"En Iniciar sesión selecciona Olvidé mi contraseña. Si existe una cuenta habilitada para ese correo, recibirás un enlace de un solo uso que vence en 30 minutos. Revisa spam y espera al menos 5 minutos antes de solicitar otro. Solicitar el enlace no cambia tu contraseña; completarlo cierra las sesiones anteriores. El segundo factor sigue siendo necesario.",
	},
	{
		category: "account",
		question: "¿Cómo configuro el autenticador?",
		answer:
			"Durante el acceso, escanea el QR con una aplicación de autenticación o introduce la clave de configuración. Confirma con su código de seis dígitos. Guarda los códigos de recuperación que aparecen al finalizar en un lugar privado fuera de este dispositivo.",
	},
	{
		category: "account",
		question: "¿Qué hago si pierdo el autenticador?",
		answer:
			"Después de escribir tu correo y contraseña, introduce uno de tus códigos de recuperación en el paso del segundo factor. Se cerrarán las sesiones anteriores y deberás configurar un nuevo autenticador antes de entrar. Los códigos anteriores quedan invalidados. Si tampoco tienes códigos, escribe a soporte para coordinar la verificación de identidad con tu institución.",
	},
	{
		category: "account",
		question: "¿Cómo genero nuevos códigos de recuperación?",
		answer:
			"En Configuración, usa la sección de códigos de recuperación y confirma con un código nuevo de tu autenticador. Los diez códigos nuevos sustituyen al conjunto anterior y solo se muestran al generarlos. No los compartas con nadie, incluido soporte.",
	},
	{
		category: "account",
		question: "¿Cómo cierro sesiones en otros dispositivos?",
		answer:
			"En Configuración, revisa las sesiones activas y revoca las que no reconozcas. Si sospechas que alguien conoce tu contraseña, cámbiala y revisa también tu correo y tu autenticador.",
	},
	{
		category: "notifications",
		question: "¿Dónde cambio mis notificaciones?",
		answer:
			"En Configuración puedes ajustar las preferencias disponibles. Se guardan en tu cuenta y se aplican a los avisos correspondientes. Los correos de seguridad de la cuenta se gestionan aparte de las preferencias académicas.",
	},
	{
		category: "notifications",
		question: "¿Por qué no recibo notificaciones del navegador?",
		answer:
			"Los avisos dependen de tus preferencias, los permisos del navegador y la compatibilidad del dispositivo. Comprueba el permiso del sitio y el modo No molestar. Consulta siempre tus tareas y evaluaciones en la plataforma; un aviso no sustituye esa información.",
	},
];
export const supportEmail = "soporte@auragrade.co";
