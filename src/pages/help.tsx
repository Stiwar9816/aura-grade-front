import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import { useAuth } from "@/hooks";
import { helpCategories, helpFaqs, supportEmail } from "@/data/help";

const normalize = (value: string) =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
export default function HelpPage() {
	const { user } = useAuth();
	const [category, setCategory] = useState<string>("general");
	const [query, setQuery] = useState("");
	const search = normalize(query);
	const results = helpFaqs.filter((faq) =>
		search
			? normalize(`${faq.question} ${faq.answer}`).includes(search)
			: faq.category === category,
	);
	const content = (
		<div className="mx-auto max-w-6xl space-y-6">
			<Card>
				<p className="mb-2 text-sm font-semibold text-electric-600">
					CENTRO DE AYUDA · Actualizado el 10 de septiembre de 2026
				</p>
				<h2 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
					Resuelve tus dudas y continúa con tu trabajo
				</h2>
				<p className="mb-6 text-gray-600">
					Guías de acceso, entregas y evaluación para estudiantes, docentes y
					administradores.
				</p>
				<label
					htmlFor="help-search"
					className="mb-2 block font-medium text-gray-900"
				>
					Buscar en toda la ayuda
				</label>
				<input
					id="help-search"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Prueba con contraseña, DOCX o calificación"
					className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-electric-500"
				/>
			</Card>
			<div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
				<aside className="space-y-6">
					<Card>
						<nav
							aria-label="Categorías de ayuda"
							className="flex flex-wrap gap-2 lg:flex-col"
						>
							{helpCategories.map((item) => (
								<button
									key={item.id}
									type="button"
									aria-pressed={!search && category === item.id}
									onClick={() => {
										setCategory(item.id);
										setQuery("");
									}}
									className={`min-h-11 rounded-lg px-3 py-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-electric-500 ${!search && category === item.id ? "bg-electric-50 text-electric-700" : "text-gray-700 hover:bg-gray-100"}`}
								>
									{item.name}
								</button>
							))}
						</nav>
					</Card>
					<Card>
						<h2 className="mb-2 text-lg font-bold text-gray-900">
							Contacta a soporte
						</h2>
						<p className="mb-4 text-sm text-gray-600">
							Para problemas de acceso o funcionamiento. Las consultas sobre
							notas y plazos corresponden a tu docente.
						</p>
						<a
							href={`mailto:${supportEmail}?subject=Ayuda%20con%20Aura%20Grade`}
							className="inline-flex min-h-11 items-center break-all font-semibold text-electric-700 underline underline-offset-4"
						>
							{supportEmail}
						</a>
					</Card>
				</aside>
				<div className="space-y-6">
					<Card>
						<h2 className="text-xl font-bold text-gray-900">
							{search
								? "Resultados de búsqueda"
								: helpCategories.find((item) => item.id === category)?.name}
						</h2>
						<p role="status" className="mb-5 mt-1 text-sm text-gray-600">
							{results.length} preguntas {search && "en todas las categorías"}
						</p>
						<div className="space-y-3">
							{results.map((faq) => (
								<details
									key={faq.question}
									className="group rounded-xl border border-gray-200"
								>
									<summary className="cursor-pointer rounded-xl p-4 font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-electric-500">
										{faq.question}
									</summary>
									<p className="border-t border-gray-100 p-4 leading-relaxed text-gray-700">
										{faq.answer}
									</p>
								</details>
							))}
						</div>
						{!results.length && (
							<div className="py-6">
								<p className="text-gray-700">
									No encontramos resultados. Prueba con otra palabra o escribe a
									soporte.
								</p>
								<button
									type="button"
									onClick={() => setQuery("")}
									className="mt-3 min-h-11 text-electric-700 underline"
								>
									Limpiar búsqueda
								</button>
							</div>
						)}
					</Card>
					<Card>
						<h2 className="mb-3 text-xl font-bold text-gray-900">
							Cómo reportar un problema
						</h2>
						<ol className="list-decimal space-y-2 pl-5 leading-relaxed text-gray-700">
							<li>
								Indica tu institución, tu rol y la pantalla donde ocurrió.
							</li>
							<li>
								Describe los pasos, qué esperabas y qué ocurrió, con fecha, hora
								y navegador.
							</li>
							<li>
								Incluye el identificador de la tarea o entrega y el mensaje de
								error. Oculta datos personales de otras personas en las
								capturas.
							</li>
						</ol>
						<p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
							Soporte nunca necesita tu contraseña, códigos del autenticador,
							códigos de recuperación ni el enlace para restablecer tu
							contraseña.
						</p>
					</Card>
				</div>
			</div>
			<footer className="flex flex-wrap gap-5 text-sm text-gray-600">
				<Link href="/privacy" className="underline">
					Información sobre privacidad
				</Link>
				<Link href="/terms" className="underline">
					Condiciones de uso
				</Link>
			</footer>
		</div>
	);
	if (user) return <Layout title="Ayuda y soporte">{content}</Layout>;
	return (
		<div className="min-h-screen bg-background-bone">
			<Head>
				<title>Ayuda y soporte | Aura Grade</title>
			</Head>
			<header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
				<Link href="/" className="text-xl font-bold text-gray-900">
					Aura Grade
				</Link>
				<Link href="/login" className="text-electric-700 underline">
					Iniciar sesión
				</Link>
			</header>
			<main className="px-4 py-6 md:px-8">
				<h1 className="mx-auto mb-6 max-w-6xl text-3xl font-bold text-gray-900">
					Ayuda y soporte
				</h1>
				{content}
			</main>
		</div>
	);
}
