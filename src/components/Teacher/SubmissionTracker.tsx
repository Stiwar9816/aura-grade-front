import React, {useState} from "react";
import {Submission} from "@/types";

const SubmissionTracker: React.FC = () => {
	const [filter, setFilter] = useState<string>("all");
	const [search, setSearch] = useState<string>("");
	const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
		null
	);

	const submissions: Submission[] = [
		{
			id: "1",
			studentName: "María González",
			studentEmail: "maria.gonzalez@email.com",
			assignmentTitle: "Ensayo sobre IA en Educación",
			submittedAt: "2024-01-15T14:30:00",
			status: "graded",
			grade: 8.7,
			aiConfidence: 92,
			needsAttention: false,
		},
		{
			id: "2",
			studentName: "Carlos Ruiz",
			studentEmail: "carlos.ruiz@email.com",
			assignmentTitle: "Análisis de Caso Estudio",
			submittedAt: "2024-01-15T16:45:00",
			status: "pending",
			grade: undefined,
			aiConfidence: undefined,
			needsAttention: true,
		},
		{
			id: "3",
			studentName: "Ana Martínez",
			studentEmail: "ana.martinez@email.com",
			assignmentTitle: "Proyecto Final de Investigación",
			submittedAt: "2024-01-14T10:15:00",
			status: "graded",
			grade: 9.2,
			aiConfidence: 95,
			needsAttention: false,
		},
		{
			id: "4",
			studentName: "Luis Fernández",
			studentEmail: "luis.fernandez@email.com",
			assignmentTitle: "Reflexión Semanal",
			submittedAt: "2024-01-16T09:20:00",
			status: "in_review",
			grade: undefined,
			aiConfidence: 88,
			needsAttention: false,
		},
		{
			id: "5",
			studentName: "Sofía Ramírez",
			studentEmail: "sofia.ramirez@email.com",
			assignmentTitle: "Ensayo sobre IA en Educación",
			submittedAt: "2024-01-17T11:45:00",
			status: "overdue",
			grade: undefined,
			aiConfidence: undefined,
			needsAttention: true,
		},
	];

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
			case "graded":
				return {
					color: "bg-green-100 text-green-800",
					icon: "✅",
					label: "Calificado",
				};
			case "pending":
				return {
					color: "bg-yellow-100 text-yellow-800",
					icon: "⏳",
					label: "Pendiente",
				};
			case "in_review":
				return {
					color: "bg-blue-100 text-blue-800",
					icon: "🔍",
					label: "En revisión",
				};
			case "overdue":
				return {
					color: "bg-red-100 text-red-800",
					icon: "⚠️",
					label: "Atrasado",
				};
			default:
				return {
					color: "bg-gray-100 text-gray-800",
					icon: "📄",
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
		<div className="card p-6">
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
							className="input-primary pl-10"
						/>
						<span className="absolute left-3 top-3 text-gray-400">🔍</span>
					</div>

					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="input-primary"
					>
						<option value="all">Todas las entregas</option>
						<option value="pending">Pendientes de calificar</option>
						<option value="graded">Calificadas</option>
						<option value="in_review">En revisión</option>
						<option value="overdue">Atrasadas</option>
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
				<div className="bg-yellow-50 p-4 rounded-xl">
					<div className="text-sm text-gray-600">Pendientes</div>
					<div className="text-2xl font-bold text-yellow-600">
						{submissions.filter((s) => s.status === "pending").length}
					</div>
				</div>
				<div className="bg-green-50 p-4 rounded-xl">
					<div className="text-sm text-gray-600">Calificadas</div>
					<div className="text-2xl font-bold text-green-600">
						{submissions.filter((s) => s.status === "graded").length}
					</div>
				</div>
				<div className="bg-red-50 p-4 rounded-xl">
					<div className="text-sm text-gray-600">Atención</div>
					<div className="text-2xl font-bold text-red-600">
						{submissions.filter((s) => s.needsAttention).length}
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
								Tarea
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Estado
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Calificación
							</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">
								Confianza IA
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
											<div className="text-xs text-gray-500 mt-1">
												{getTimeSince(submission.submittedAt)}
											</div>
										</div>
									</td>
									<td className="py-4 px-4">
										<div className="font-medium text-gray-900">
											{submission.assignmentTitle}
										</div>
									</td>
									<td className="py-4 px-4">
										<span
											className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusConfig.color}`}
										>
											<span>{statusConfig.icon}</span>
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
										{submission.aiConfidence ? (
											<div className="flex items-center gap-2">
												<div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
													<div
														className={`h-full ${
															submission.aiConfidence >= 90
																? "bg-green-500"
																: submission.aiConfidence >= 80
																? "bg-yellow-500"
																: "bg-red-500"
														}`}
														style={{width: `${submission.aiConfidence}%`}}
													/>
												</div>
												<span className="text-sm font-medium text-gray-900">
													{submission.aiConfidence}%
												</span>
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
												{submission.status === "graded" ? "Ver" : "Evaluar"}
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
			<div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
				<div className="flex items-center gap-3">
					<select className="input-primary text-sm">
						<option>Acciones en lote</option>
						<option>Marcar como calificadas</option>
						<option>Enviar recordatorio</option>
						<option>Exportar seleccionadas</option>
					</select>
					<button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
						Aplicar
					</button>
				</div>

				<div className="text-sm text-gray-600">
					Mostrando {filteredSubmissions.length} de {submissions.length}{" "}
					entregas
				</div>
			</div>
		</div>
	);
};

export default SubmissionTracker;
