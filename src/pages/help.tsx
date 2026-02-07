import React, {useState} from "react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";

const HelpPage: React.FC = () => {
	const [activeCategory, setActiveCategory] = useState("general");
	const [searchQuery, setSearchQuery] = useState("");

	const categories = [
		{id: "general", name: "General", icon: "📚"},
		{id: "submissions", name: "Entregas", icon: "📤"},
		{id: "grading", name: "Calificaciones", icon: "📊"},
		{id: "ai", name: "IA y Evaluación", icon: "🤖"},
		{id: "account", name: "Mi Cuenta", icon: "👤"},
	];

	const faqs = {
		general: [
			{
				question: "¿Qué es Aura Grade?",
				answer:
					"Aura Grade es una plataforma de evaluación educativa asistida por IA que ayuda a docentes y estudiantes en el proceso de calificación y retroalimentación.",
			},
			{
				question: "¿Cómo empiezo a usar la plataforma?",
				answer:
					"Después de registrarte, puedes acceder a tu dashboard donde encontrarás todas las herramientas disponibles según tu rol (estudiante o docente).",
			},
			{
				question: "¿Es segura mi información?",
				answer:
					"Sí, utilizamos encriptación de última generación y seguimos las mejores prácticas de seguridad para proteger tus datos.",
			},
		],
		submissions: [
			{
				question: "¿Qué formatos de archivo puedo subir?",
				answer:
					"Actualmente soportamos PDF, DOCX, TXT y otros formatos de documentos comunes.",
			},
			{
				question: "¿Cuál es el tamaño máximo de archivo?",
				answer:
					"El tamaño máximo por archivo es de 10MB. Para archivos más grandes, contacta a tu docente.",
			},
			{
				question: "¿Puedo editar una entrega después de subirla?",
				answer:
					"Puedes reemplazar tu entrega antes de la fecha límite. Después de esa fecha, necesitarás permiso del docente.",
			},
		],
		grading: [
			{
				question: "¿Cómo funciona la calificación por IA?",
				answer:
					"Nuestra IA analiza tu trabajo según criterios predefinidos en la rúbrica, proporcionando una evaluación objetiva y consistente.",
			},
			{
				question: "¿Puedo solicitar una revisión de mi calificación?",
				answer:
					"Sí, puedes solicitar una revisión manual por parte de tu docente desde el panel de calificaciones.",
			},
			{
				question: "¿Cuánto tiempo tarda la evaluación?",
				answer:
					"La evaluación por IA generalmente toma menos de 30 segundos. Las revisiones manuales dependen de la disponibilidad del docente.",
			},
		],
		ai: [
			{
				question: "¿Qué tan precisa es la IA?",
				answer:
					"Nuestra IA tiene una precisión del 94% comparada con evaluaciones humanas, y mejora continuamente con cada evaluación.",
			},
			{
				question: "¿La IA reemplaza a los docentes?",
				answer:
					"No, la IA es una herramienta de apoyo. Los docentes siempre pueden revisar y ajustar las calificaciones generadas por IA.",
			},
			{
				question: "¿Cómo se entrena la IA?",
				answer:
					"Nuestra IA se entrena con miles de ejemplos de trabajos evaluados por docentes expertos, siguiendo estándares educativos reconocidos.",
			},
		],
		account: [
			{
				question: "¿Cómo cambio mi contraseña?",
				answer:
					"Ve a Configuración > Seguridad y selecciona 'Cambiar contraseña'. Necesitarás tu contraseña actual.",
			},
			{
				question: "¿Puedo cambiar mi rol?",
				answer:
					"No, el rol es asignado al momento del registro. Si necesitas cambiar tu rol, contacta al administrador.",
			},
			{
				question: "¿Cómo elimino mi cuenta?",
				answer:
					"Puedes eliminar tu cuenta desde Configuración > Zona de Peligro. Esta acción es irreversible.",
			},
		],
	};

	const filteredFaqs = faqs[activeCategory as keyof typeof faqs].filter(
		(faq) =>
			faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
			faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<ProtectedRoute>
			<Layout title="Ayuda y Soporte">
				<div className="max-w-6xl mx-auto">
					{/* Header con búsqueda */}
					<Card className="mb-6">
						<div className="text-center mb-6">
							<div className="text-4xl mb-4">💡</div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								¿En qué podemos ayudarte?
							</h2>
							<p className="text-gray-600">
								Busca en nuestra base de conocimientos o contacta con soporte
							</p>
						</div>

						<div className="relative max-w-2xl mx-auto">
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Buscar en ayuda..."
								className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:border-electric-500 focus:ring-2 focus:ring-electric-200 outline-none"
							/>
							<svg
								className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</Card>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						{/* Categorías */}
						<div className="lg:col-span-1">
							<Card>
								<h3 className="font-bold text-gray-900 mb-4">Categorías</h3>
								<div className="space-y-2">
									{categories.map((category) => (
										<button
											key={category.id}
											onClick={() => setActiveCategory(category.id)}
											className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
												activeCategory === category.id
													? "bg-electric-50 text-electric-600 font-semibold"
													: "text-gray-700 hover:bg-gray-50"
											}`}
										>
											<span className="text-xl">{category.icon}</span>
											<span>{category.name}</span>
										</button>
									))}
								</div>
							</Card>

							{/* Contacto */}
							<Card className="mt-6 bg-gradient-to-br from-electric-50 to-cyan-50">
								<div className="text-center">
									<div className="text-3xl mb-3">📧</div>
									<h4 className="font-bold text-gray-900 mb-2">
										¿Necesitas más ayuda?
									</h4>
									<p className="text-sm text-gray-600 mb-4">
										Nuestro equipo está aquí para ayudarte
									</p>
									<button className="btn-primary w-full">
										Contactar Soporte
									</button>
								</div>
							</Card>
						</div>

						{/* FAQs */}
						<div className="lg:col-span-3">
							<Card>
								<SectionHeader
									title={
										categories.find((c) => c.id === activeCategory)?.name ||
										"General"
									}
									description={`${filteredFaqs.length} preguntas frecuentes`}
									className="mb-6"
								/>

								<div className="space-y-4">
									{filteredFaqs.length > 0 ? (
										filteredFaqs.map((faq, index) => (
											<details
												key={index}
												className="group border border-gray-200 rounded-lg overflow-hidden"
											>
												<summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
													<span className="font-medium text-gray-900 pr-4">
														{faq.question}
													</span>
													<svg
														className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform flex-shrink-0"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												</summary>
												<div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
													{faq.answer}
												</div>
											</details>
										))
									) : (
										<div className="text-center py-12">
											<div className="text-4xl mb-4">🔍</div>
											<h3 className="font-bold text-gray-900 mb-2">
												No se encontraron resultados
											</h3>
											<p className="text-gray-600">
												Intenta con otros términos de búsqueda
											</p>
										</div>
									)}
								</div>
							</Card>

							{/* Recursos adicionales */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
								<Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
									<div className="text-3xl mb-3">📖</div>
									<h4 className="font-bold text-gray-900 mb-1">
										Documentación
									</h4>
									<p className="text-sm text-gray-600">
										Guías completas y tutoriales
									</p>
								</Card>

								<Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
									<div className="text-3xl mb-3">🎥</div>
									<h4 className="font-bold text-gray-900 mb-1">
										Video Tutoriales
									</h4>
									<p className="text-sm text-gray-600">
										Aprende viendo ejemplos
									</p>
								</Card>

								<Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
									<div className="text-3xl mb-3">💬</div>
									<h4 className="font-bold text-gray-900 mb-1">Comunidad</h4>
									<p className="text-sm text-gray-600">
										Conecta con otros usuarios
									</p>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default HelpPage;
