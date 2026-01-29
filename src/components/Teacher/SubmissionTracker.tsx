import React, {useState} from "react";
import {Submission} from "@/types";
import {useSubmission} from "@/hooks";

const SubmissionTracker: React.FC = () => {
	const {submissions: dataSubmissions, loading} = useSubmission();
	const [filter, setFilter] = useState<string>("all");
	const [search, setSearch] = useState<string>("");

	// Fallback to empty array if loading or error
	const submissions: Submission[] = dataSubmissions || [];

	const filteredSubmissions = submissions.filter((submission) => {
		if (filter !== "all" && submission.status !== filter) return false;
		if (
			search &&
			!submission.studentName.toLowerCase().includes(search.toLowerCase())
		)
			return false;
		return true;
	});

	const getStatusConfig = (status: Submission["status"]) => {
		switch (status) {
			case "PUBLISHED":
				return {
					color: "bg-green-100 text-green-800",
					label: "Calificado",
				};
			case "PENDING":
				return {
					color: "bg-yellow-100 text-yellow-800",
					label: "Pendiente",
				};
			case "REVIEW_PENDING":
				return {
					color: "bg-blue-100 text-blue-800",
					label: "En revisión",
				};
			case "IN_PROGRESS":
				return {
					color: "bg-yellow-100 text-yellow-800",
					label: "En progreso",
				};
			case "FAILED":
				return {
					color: "bg-red-100 text-red-800",
					label: "Fallido",
				};
			default:
				return {
					color: "bg-gray-100 text-gray-800",
					label: "Enviado",
				};
		}
	};

	const getTimeSince = (dateString: string) => {
		const now = new Date();
		const date = new Date(dateString);
		const diff = now.getTime() - date.getTime();

		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days > 0) return `Hace ${days} día${days > 1 ? "s" : ""}`;
		if (hours > 0) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
		if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
		return "Ahora mismo";
	};

	return (
		<div className="card p-6 mt-4">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Seguimiento de Entregas
					</h2>
					<p className="text-gray-600 mt-1">
						Monitorea y gestiona todas las entregas de estudiantes
					</p>
				</div>

				<div className="flex flex-wrap gap-3">
					<div className="relative flex-1 md:w-64">
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Buscar estudiante..."
							className="input-primary"
						/>
					</div>

					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="input-primary"
					>
						<option value="all">Todas las entregas</option>
						<option value="PENDING">Pendientes de calificar</option>
						<option value="PUBLISHED">Calificadas</option>
						<option value="REVIEW_PENDING">En revisión</option>
						<option value="FAILED">Fallidas</option>
					</select>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-gray-50 p-4 rounded-xl">
					<div className="text-sm text-gray-600">Total</div>
					<div className="text-2xl font-bold text-gray-900">
						{submissions.length}
					</div>
				</div>
				<div className="bg-blue-50 p-4 rounded-xl">
					<div className="text-sm text-gray-600">Revisión</div>
					<div className="text-2xl font-bold text-blue-600">
						{submissions.filter((s) => s.status === "REVIEW_PENDING").length}
					</div>
				</div>
				<div className="bg-yellow-50 p-4 rounded-xl">
					<div className="text-sm text-gray-600">Pendientes</div>
					<div className="text-2xl font-bold text-yellow-600">
						{submissions.filter((s) => s.status === "PENDING").length}
					</div>
				</div>
				<div className="bg-green-50 p-4 rounded-xl">
					<div className="text-sm text-gray-600">Calificadas</div>
					<div className="text-2xl font-bold text-green-600">
						{submissions.filter((s) => s.status === "PUBLISHED").length}
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Estudiante
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Curso
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Tarea
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Estado
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Calificación
							</th>

							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredSubmissions.map((submission) => {
							const statusConfig = getStatusConfig(submission.status);

							return (
								<tr
									key={submission.id}
									className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
										submission.needsAttention
											? "bg-red-50 hover:bg-red-100"
											: ""
									}`}
								>
									<td className="py-4 px-4">
										<div>
											<div className="font-medium text-gray-900">
												{submission.studentName}
											</div>
											<div className="text-sm text-gray-600">
												{submission.studentEmail}
											</div>
											<div className="text-xs text-gray-400 mt-1">
												{getTimeSince(submission.submittedAt)}
											</div>
										</div>
									</td>
									<td className="py-4 px-4">
										<div className="font-normal text-gray-600">
											{submission.courseName}
										</div>
									</td>
									<td className="py-4 px-4">
										<div className="font-normal text-gray-600">
											{submission.assignmentTitle}
										</div>
									</td>
									<td className="py-4 px-4">
										<span
											className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusConfig.color} font-medium`}
										>
											<span>{statusConfig.label}</span>
										</span>
									</td>
									<td className="py-4 px-4">
										{submission.grade ? (
											<div className="flex items-center gap-2">
												<div
													className={`text-lg font-bold ${
														submission.grade >= 9
															? "text-green-600"
															: submission.grade >= 7
																? "text-blue-600"
																: submission.grade >= 6
																	? "text-yellow-600"
																	: "text-red-600"
													}`}
												>
													{submission.grade.toFixed(1)}
												</div>
												<div className="text-sm text-gray-600">/10</div>
											</div>
										) : (
											<div className="text-gray-400">—</div>
										)}
									</td>
									<td className="py-4 px-4">
										<div className="flex gap-2">
											<button
												onClick={() =>
													(window.location.href = `/evaluation?submission=${submission.id}`)
												}
												className="px-3 py-1.5 bg-electric-500 text-white text-sm rounded-lg hover:bg-electric-600"
											>
												{submission.status === "PUBLISHED" ? "Ver" : "Evaluar"}
											</button>

											{submission.needsAttention && (
												<button className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200">
													⚠️
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{filteredSubmissions.length === 0 && (
				<div className="text-center py-12">
					<div className="text-4xl mb-4">📭</div>
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						No se encontraron entregas
					</h3>
					<p className="text-gray-600 mb-6">
						{filter === "all"
							? "No hay entregas para mostrar"
							: `No hay entregas con estado "${filter}"`}
					</p>
					<button
						onClick={() => {
							setFilter("all");
							setSearch("");
						}}
						className="btn-ghost"
					>
						Limpiar filtros
					</button>
				</div>
			)}

			{/* Bulk Actions */}
			<div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200">
				{/* <div className="flex items-center gap-3">
					<select className="input-primary text-sm">
						<option>Acciones en lote</option>
						<option>Marcar como calificadas</option>
						<option>Enviar recordatorio</option>
						<option>Exportar seleccionadas</option>
					</select>
					<button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
						Aplicar
					</button>
				</div> */}

				<div className="text-sm text-gray-600">
					Mostrando {filteredSubmissions.length} de {submissions.length}{" "}
					entregas
				</div>
			</div>
		</div>
	);
};

export default SubmissionTracker;
