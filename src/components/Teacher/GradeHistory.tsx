import React, {useState, useMemo} from "react";
import {useSubmission} from "@/hooks";
import {STANDARD_GRADE_MAX} from "@/utils/gradeScale";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faFileCsv,
	faSearch,
	faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const GradeHistory: React.FC = () => {
	const {submissions: dataSubmissions, loading, error} = useSubmission();

	const [search, setSearch] = useState("");
	const [selectedCourse, setSelectedCourse] = useState("all");
	const [selectedAssignment, setSelectedAssignment] = useState("all");

	// Tomamos todas las entregas para que el profesor vea todos los estudiantes
	const publishedSubmissions = useMemo(() => {
		return dataSubmissions || [];
	}, [dataSubmissions]);

	// Extraer cursos únicos
	const courses = useMemo(() => {
		const courseSet = new Set<string>();
		publishedSubmissions.forEach((s) => {
			if (s.courseName) courseSet.add(s.courseName);
		});
		return Array.from(courseSet).sort();
	}, [publishedSubmissions]);

	// Extraer tareas únicas (dependiendo del curso seleccionado)
	const assignments = useMemo(() => {
		const assignmentSet = new Set<string>();
		publishedSubmissions.forEach((s) => {
			if (selectedCourse === "all" || s.courseName === selectedCourse) {
				if (s.assignmentTitle) assignmentSet.add(s.assignmentTitle);
			}
		});
		return Array.from(assignmentSet).sort();
	}, [publishedSubmissions, selectedCourse]);

	// Filtrar para la tabla
	const filteredSubmissions = useMemo(() => {
		return publishedSubmissions.filter((s) => {
			if (
				search &&
				!s.studentName.toLowerCase().includes(search.toLowerCase()) &&
				!s.studentEmail.toLowerCase().includes(search.toLowerCase())
			) {
				return false;
			}
			if (selectedCourse !== "all" && s.courseName !== selectedCourse) {
				return false;
			}
			if (
				selectedAssignment !== "all" &&
				s.assignmentTitle !== selectedAssignment
			) {
				return false;
			}
			return true;
		});
	}, [publishedSubmissions, search, selectedCourse, selectedAssignment]);

	const handleExportCSV = () => {
		if (filteredSubmissions.length === 0) return;

		// Crear las cabeceras
		const headers = [
			"Estudiante",
			"Email",
			"Curso",
			"Tarea",
			"Fecha de Entrega",
			"Calificación",
			"Nota Máxima",
		];

		// Mapear los datos
		const rows = filteredSubmissions.map((s) => [
			`"${s.studentName}"`,
			`"${s.studentEmail}"`,
			`"${s.courseName}"`,
			`"${s.assignmentTitle}"`,
			`"${new Date(s.submittedAt).toLocaleString("es-ES")}"`,
			`"${typeof s.grade === "number" ? s.grade.toFixed(1) : "N/A"}"`,
			`"${STANDARD_GRADE_MAX}"`,
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((e) => e.join(",")),
		].join("\n");

		// Añadir el BOM para que Excel (y otros) interpreten UTF-8 correctamente
		const blob = new Blob(["\uFEFF" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.setAttribute(
			"download",
			`reporte_notas_${selectedCourse === "all" ? "todos" : selectedCourse}_${new Date().getTime()}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="card p-6 mt-4 dark:bg-slate-900 dark:border-slate-800">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Histórico de Notas
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						Consulta y exporta las calificaciones de tus estudiantes
					</p>
				</div>

				<button
					onClick={handleExportCSV}
					disabled={filteredSubmissions.length === 0}
					className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					title="Exportar CSV"
				>
					<FontAwesomeIcon icon={faFileCsv} />
					Exportar CSV
				</button>
			</div>

			{error && (
				<div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
					<p className="text-sm font-semibold text-red-700 dark:text-red-400">
						No se pudo cargar el histórico: {error.message}
					</p>
				</div>
			)}

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 p-5 bg-gray-50/80 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700/50">
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
						Búsqueda
					</label>
					<div className="relative w-full">
						<FontAwesomeIcon
							icon={faSearch}
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
						/>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Nombre o email..."
							className="input-primary pl-10 w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
						Curso
					</label>
					<select
						value={selectedCourse}
						onChange={(e) => {
							setSelectedCourse(e.target.value);
							setSelectedAssignment("all"); // Reset assignment when course changes
						}}
						className="input-primary w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white"
					>
						<option value="all">Todos los cursos</option>
						{courses.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
						Tarea
					</label>
					<select
						value={selectedAssignment}
						onChange={(e) => setSelectedAssignment(e.target.value)}
						className="input-primary w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white"
						disabled={selectedCourse === "all" && assignments.length === 0}
					>
						<option value="all">Todas las tareas</option>
						{assignments.map((a) => (
							<option key={a} value={a}>
								{a}
							</option>
						))}
					</select>
				</div>
			</div>

			{loading ? (
				<div className="space-y-3">
					<div className="h-12 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
					<div className="h-12 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
					<div className="h-12 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
				</div>
			) : filteredSubmissions.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-4xl mb-4 text-gray-300 dark:text-slate-700">
						<FontAwesomeIcon icon={faBoxOpen} />
					</div>
					<h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
						No hay calificaciones para mostrar
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						Intenta cambiar los filtros o califica algunas entregas primero.
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700/50">
					<table className="w-full">
						<thead className="bg-gray-50 dark:bg-slate-800/50">
							<tr className="border-b border-gray-200 dark:border-slate-700/50">
								<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
									Estudiante
								</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
									Curso
								</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
									Tarea
								</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
									Fecha
								</th>
								<th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
									Calificación
								</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-slate-900/50 divide-y divide-gray-100 dark:divide-slate-800/50">
							{filteredSubmissions.map((s) => (
								<tr
									key={s.id}
									className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
								>
									<td className="py-3 px-4">
										<div className="font-medium text-gray-900 dark:text-white">
											{s.studentName}
										</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">
											{s.studentEmail}
										</div>
									</td>
									<td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
										{s.courseName}
									</td>
									<td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
										{s.assignmentTitle}
									</td>
									<td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
										{new Date(s.submittedAt).toLocaleDateString("es-ES", {
											day: "2-digit",
											month: "short",
											year: "numeric",
										})}
									</td>
									<td className="py-3 px-4 text-right">
										{typeof s.grade === "number" ? (
											<span className="inline-flex items-center gap-1 font-bold">
												<span
													className={
														s.grade >= 4.5
															? "text-green-600 dark:text-green-400"
															: s.grade >= 4
																? "text-blue-600 dark:text-blue-400"
																: s.grade >= 3
																	? "text-yellow-600 dark:text-yellow-400"
																	: "text-red-600 dark:text-red-400"
													}
												>
													{s.grade.toFixed(2)}
												</span>
												<span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
													/{STANDARD_GRADE_MAX}
												</span>
											</span>
										) : (
											<span className="text-gray-400 dark:text-gray-600">
												-
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default GradeHistory;
