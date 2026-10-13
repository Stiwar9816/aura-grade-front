import Head from "next/head";
import Link from "next/link";
export default function InformationPage() {
	return (
		<main className="min-h-screen bg-background-bone px-5 py-10">
			<Head>
				<title>Información sobre privacidad | Aura Grade</title>
			</Head>
			<article className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 md:p-10">
				<Link href="/help" className="text-electric-700 underline">
					Volver a ayuda y soporte
				</Link>
				<h1 className="mb-6 mt-6 text-3xl font-bold text-gray-900">
					Información sobre privacidad
				</h1>
				<p className="mb-6 text-sm text-gray-500">
					Actualizado el 10 de septiembre de 2026
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					La plataforma utiliza tus datos de cuenta, institución, cursos,
					entregas y evaluaciones para prestar el servicio educativo. Los
					permisos dependen de tu rol y de tu relación con la actividad.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Los documentos se almacenan mediante Cloudinary. El texto extraído y
					la rúbrica se envían al proveedor de inteligencia artificial
					configurado por el servicio (OpenAI o Google Gemini) para generar el
					borrador de evaluación. Los correos se entregan mediante Resend. La
					configuración puede incluir Sentry para diagnóstico técnico de
					errores.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					No incluyas datos sensibles o de terceros que no sean necesarios para
					la actividad. Consulta con tu institución qué documentos puedes
					compartir y qué condiciones de tratamiento y conservación aplican a tu
					cuenta.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Las cookies de sesión permiten mantener el acceso. Las preferencias de
					visualización pueden guardarse en el navegador; las preferencias de
					notificaciones se asocian a tu cuenta.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Para consultar, corregir o solicitar la eliminación de tus datos,
					contacta a tu institución y a soporte@auragrade.co. La solicitud
					requiere verificar tu identidad y revisar las obligaciones de
					conservación del historial académico. No existe un botón de borrado
					inmediato de toda la cuenta.
				</p>
				<a
					className="break-all text-electric-700 underline"
					href="mailto:soporte@auragrade.co"
				>
					soporte@auragrade.co
				</a>
			</article>
		</main>
	);
}
