import Head from "next/head";
import Link from "next/link";
export default function InformationPage() {
	return (
		<main className="min-h-screen bg-background-bone px-5 py-10">
			<Head>
				<title>Condiciones de uso | Aura Grade</title>
			</Head>
			<article className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 md:p-10">
				<Link href="/help" className="text-electric-700 underline">
					Volver a ayuda y soporte
				</Link>
				<h1 className="mb-6 mt-6 text-3xl font-bold text-gray-900">
					Condiciones de uso
				</h1>
				<p className="mb-6 text-sm text-gray-500">
					Actualizado el 10 de septiembre de 2026
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Utiliza Aura Grade únicamente con una cuenta autorizada por tu
					institución y para las actividades educativas que te correspondan.
					Mantén privados tus datos de acceso y tus códigos de recuperación.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Comparte solo documentos que tengas autorización para utilizar. No
					intentes acceder a cuentas, cursos o entregas ajenas ni interferir con
					el funcionamiento del servicio.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Las evaluaciones de inteligencia artificial son propuestas que pueden
					contener errores. El docente revisa y publica la calificación; las
					consultas y solicitudes de reevaluación siguen el proceso académico de
					la institución.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Los plazos y ampliaciones los gestiona el docente. La disponibilidad y
					el tiempo de procesamiento dependen también de servicios externos.
					Consulta el estado de tu entrega en la plataforma y reporta los
					errores a soporte.
				</p>
				<p className="mb-5 leading-relaxed text-gray-700">
					Estas condiciones describen el uso de la plataforma y se complementan
					con las reglas y acuerdos comunicados por tu institución. Para
					aclaraciones, escribe a soporte@auragrade.co.
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
