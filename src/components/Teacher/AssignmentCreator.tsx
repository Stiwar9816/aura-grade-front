import React, {useEffect, useState} from "react";
import {useAssignments, useCourse, useRubrics} from "@/hooks";
import Card from "@/components/Common/Card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleCheck, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import {
	notifyError,
	notifyLoading,
	notifySuccess,
	notifyWarning,
} from "@/utils/toastNotify";
import type {CoursesData, RubricTemplate} from "@/interface";
import {useRouter} from "next/router";

type CourseOption = CoursesData["courses"][number];
type AssignmentDraft = {
	title: string;
	description: string;
	dueDate: string;
	courseId: string;
	rubricId: string;
};

const ASSIGNMENT_DRAFT_STORAGE_KEY = "aura-grade:assignment-draft";

const getErrorMessage = (error: unknown, fallback: string) =>
	error instanceof Error ? error.message : fallback;

const AssignmentCreator: React.FC = () => {
	const router = useRouter();
	const {createAssignment, createLoading} = useAssignments();
	const {courses, loading: coursesLoading} = useCourse();
	const {rubrics, loading: rubricsLoading} = useRubrics();

	const [form, setForm] = useState<AssignmentDraft>({
		title: "",
		description: "",
		dueDate: "",
		courseId: "",
		rubricId: "",
	});

	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!router.isReady) return;
		try {
			const stored = sessionStorage.getItem(ASSIGNMENT_DRAFT_STORAGE_KEY);
			if (stored) {
				const draft = JSON.parse(stored) as Partial<AssignmentDraft>;
				// The draft is external browser state and must be restored after hydration.
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setForm((current) => ({
					...current,
					title: typeof draft.title === "string" ? draft.title : current.title,
					description:
						typeof draft.description === "string"
							? draft.description
							: current.description,
					dueDate:
						typeof draft.dueDate === "string" ? draft.dueDate : current.dueDate,
					courseId:
						typeof draft.courseId === "string" ? draft.courseId : current.courseId,
					rubricId:
						typeof router.query.rubricId === "string"
							? router.query.rubricId
							: typeof draft.rubricId === "string"
								? draft.rubricId
								: current.rubricId,
				}));
			}
		} catch {
			sessionStorage.removeItem(ASSIGNMENT_DRAFT_STORAGE_KEY);
		}
	}, [router.isReady, router.query.rubricId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!form.title || !form.dueDate || !form.courseId || !form.rubricId) {
			setError("Por favor completa todos los campos obligatorios.");
			notifyWarning("Completa los campos obligatorios antes de publicar.");
			return;
		}

		const notificationId = notifyLoading("Publicando tarea...");
		try {
			await createAssignment({
				title: form.title,
				description: form.description,
				dueDate: new Date(form.dueDate).toISOString(),
				courseId: form.courseId,
				rubricId: form.rubricId,
				isActive: true,
			});
			setIsSubmitted(true);
			sessionStorage.removeItem(ASSIGNMENT_DRAFT_STORAGE_KEY);
			notifySuccess(
				`Tarea "${form.title}" publicada. Los estudiantes ya pueden verla.`,
				{id: notificationId},
			);
		} catch (err: unknown) {
			const message = getErrorMessage(err, "Error al crear la tarea.");
			setError(message);
			notifyError(message, {id: notificationId});
		}
	};

	if (isSubmitted) {
		return (
			<Card className="max-w-2xl mx-auto p-8 text-center bg-white/60 border border-gray-100">
				<div className="text-6xl mb-4"><FontAwesomeIcon icon={faCircleCheck} /></div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					¡Tarea Creada con Éxito!
				</h2>
				<p className="text-gray-600 mb-6">
					La tarea ha sido publicada y los estudiantes ya pueden verla en sus
					tableros.
				</p>
				<button
					onClick={() => {
						setIsSubmitted(false);
						setForm({
							title: "",
							description: "",
							dueDate: "",
							courseId: "",
							rubricId: "",
						});
					}}
					className="btn-primary"
				>
					Crear otra tarea
				</button>
			</Card>
		);
	}

	return (
		<div className="max-w-4xl mx-auto mt-6">
			<Card className="bg-white/60 border border-gray-100 p-8">
				<form onSubmit={handleSubmit} className="space-y-6">
					{error && (
						<div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm italic">
							<FontAwesomeIcon icon={faTriangleExclamation} /> {error}
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Título */}
						<div className="md:col-span-2">
							<label className="block text-sm font-bold text-gray-700 mb-2">
								Título de la Tarea *
							</label>
							<input
								type="text"
								required
								value={form.title}
								onChange={(e) => setForm({...form, title: e.target.value})}
								placeholder="Ej: Ensayo de Historia Moderna"
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-electric-500 focus:border-transparent outline-none transition-all"
							/>
						</div>

						{/* Descripción */}
						<div className="md:col-span-2">
							<label className="block text-sm font-bold text-gray-700 mb-2">
								Descripción e Instrucciones
							</label>
							<textarea
								value={form.description}
								onChange={(e) =>
									setForm({...form, description: e.target.value})
								}
								placeholder="Detalla los requisitos de la tarea..."
								rows={4}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-electric-500 focus:border-transparent outline-none transition-all resize-none"
							/>
						</div>

						{/* Fecha de Entrega */}
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-2">
								Fecha y Hora de Entrega *
							</label>
							<input
								type="datetime-local"
								required
								value={form.dueDate}
								onChange={(e) => setForm({...form, dueDate: e.target.value})}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-electric-500 focus:border-transparent outline-none transition-all"
							/>
						</div>

						{/* Curso */}
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-2">
								Curso / Clase *
							</label>
							<select
								required
								value={form.courseId}
								onChange={(e) => setForm({...form, courseId: e.target.value})}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-electric-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
							>
								<option value="">Selecciona un curso</option>
								{courses.map((course: CourseOption) => (
									<option key={course.id} value={course.id}>
										{course.course_name}
									</option>
								))}
							</select>
							{coursesLoading && (
								<p className="text-[10px] text-gray-400 mt-1 animate-pulse">
									Cargando cursos...
								</p>
							)}
						</div>

						{/* Rúbrica */}
						<div className="md:col-span-2">
							<div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
								<label className="block text-sm font-bold text-gray-700">
									Rúbrica de Evaluación *
								</label>
								<button
									type="button"
									disabled={!form.title.trim() || !form.description.trim()}
									onClick={() => {
										sessionStorage.setItem(
											ASSIGNMENT_DRAFT_STORAGE_KEY,
											JSON.stringify(form),
										);
										void router.push({
											pathname: "/rubrics",
											query: {
												copilot: "1",
												title: form.title,
												description: form.description,
												returnTo: "/teacher/assignments",
											},
										});
									}}
									className="text-sm font-bold text-electric-600 hover:text-electric-700 disabled:cursor-not-allowed disabled:text-gray-400"
								>
									Crear rúbrica con IA desde esta tarea
								</button>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
								{rubrics
									.filter((rubric: RubricTemplate) => rubric.status !== "ARCHIVED")
									.map((rubric: RubricTemplate) => (
									<div
										key={rubric.id}
										onClick={() => setForm({...form, rubricId: rubric.id})}
										className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
											form.rubricId === rubric.id
												? "border-electric-500 bg-electric-50"
												: "border-gray-100 bg-white hover:border-gray-200"
										}`}
									>
										<div className="font-bold text-gray-900 text-sm mb-1">
											{rubric.title}
										</div>
										<div className="text-xs text-gray-500 line-clamp-2">
											{rubric.description}
										</div>
										<div className="mt-2 text-[10px] font-bold text-electric-500 uppercase">
											{rubric.maxTotalScore} Puntos
										</div>
									</div>
									))}
							</div>
							{rubricsLoading && (
								<p className="text-[10px] text-gray-400 mt-2 animate-pulse text-center">
									Cargando rúbricas...
								</p>
							)}
						</div>
					</div>

					<div className="pt-6 border-t border-gray-100 flex items-center justify-end">
						<button
							type="submit"
							disabled={createLoading}
							className={`btn-primary px-8 py-3 rounded-2xl font-bold flex items-center gap-2 ${
								createLoading ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							{createLoading ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									<span>Publicando...</span>
								</>
							) : (
								<>
									<span>Publicar Tarea</span>
								</>
							)}
						</button>
					</div>
				</form>
			</Card>
		</div>
	);
};

export default AssignmentCreator;
