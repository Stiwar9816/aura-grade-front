import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGifts} from "@fortawesome/free-solid-svg-icons";
import type {StudentPerformanceProps} from "@/interface";
import {STANDARD_GRADE_MAX} from "@/utils/gradeScale";

export const StudentPerformance: React.FC<StudentPerformanceProps> = ({
	students = [],
}) => {
	type StudentFilter = "all" | "risk" | "improving";
	const [filter, setFilter] = useState<StudentFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const filterButtons: {id: StudentFilter; label: string; color: string}[] = [
		{id: "all", label: "Todos", color: "electric"},
		{id: "risk", label: "Foco Rojo", color: "red"},
		{id: "improving", label: "Mejorando", color: "green"},
	];

	const filteredStudents = students.filter((student) => {
		const matchesSearch = student.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesFilter =
			filter === "all"
				? true
				: filter === "risk"
					? student.riskLevel === "high"
					: student.trend === "up";
		return matchesSearch && matchesFilter;
	});

	const getGradeHSL = (score: number) => {
		const hue = Math.pow(score / STANDARD_GRADE_MAX, 1.5) * 140;
		return `hsl(${hue}, 70%, 50%)`;
	};

	return (
		<div className="card p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white h-full">
			<div className="flex flex-col gap-6 mb-8">
				<div>
					<h3 className="text-2xl font-black text-gray-900">Semaforización</h3>
					<p className="text-gray-500 font-medium text-sm mt-1">
						Detección temprana de brechas cognitivas
					</p>
				</div>

				<div className="flex flex-col gap-4">
					{/* Search */}
					<div className="relative">
						<input
							type="text"
							placeholder="Buscar estudiante..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500 transition-all outline-none font-medium"
						/>
					</div>

					{/* Filters students */}
					<div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
						{filterButtons.map((btn) => (
							<button
								key={btn.id}
								onClick={() => setFilter(btn.id)}
								className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
									filter === btn.id
										? "bg-white shadow-md text-gray-900 scale-[1.05]"
										: "text-gray-500 hover:text-gray-800"
								}`}
							>
								{btn.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Students */}
			<div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
				{filteredStudents.map((student) => (
					<div
						key={student.id}
						className="group/student relative p-5 bg-white border border-gray-100 rounded-[2rem] hover:shadow-2xl hover:shadow-electric-500/5 transition-all duration-500"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center gap-4">
								<div
									className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg"
									style={{backgroundColor: getGradeHSL(student.grade)}}
								>
									{student.name.charAt(0)}
								</div>
								<div>
									<h4 className="font-bold text-gray-900 group-hover/student:text-electric-600 transition-colors uppercase tracking-tight">
										{student.name}
									</h4>
									<div className="flex items-center gap-2 mt-1">
										<div
											className={`w-2 h-2 rounded-full ${
												student.riskLevel === "high"
													? "bg-red-500 animate-pulse"
													: student.riskLevel === "medium"
														? "bg-yellow-400"
														: "bg-green-500"
											}`}
										></div>
										<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											Prioridad{" "}
											{student.riskLevel === "high" ? "Crítica" : "Baja"}
										</span>
									</div>
								</div>
							</div>
							<div className="text-right">
								<div className="text-2xl font-black text-gray-900 leading-none">
									{Number(student.grade).toFixed(2)}
								</div>
								<div className="text-[10px] font-bold text-gray-400 uppercase mt-1">
									Puntuación Total
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* No students */}
			{filteredStudents.length === 0 && (
				<div className="text-center py-2">
					<div className="text-4xl mb-2">
						<FontAwesomeIcon icon={faGifts} />
					</div>
					<h4 className="font-medium text-gray-900 mb-2">
						¡Excelentes noticias!
					</h4>
					<p className="text-gray-600">
						No hay estudiantes en riesgo en este momento
					</p>
				</div>
			)}

			{/* Summary */}
			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="grid grid-cols-3 gap-4">
					<div className="text-center p-3">
						<div className="text-lg font-bold text-gray-900">
							{students.filter((s) => s.riskLevel === "high").length}
						</div>
						<div className="text-sm text-gray-600">En riesgo alto</div>
					</div>
					<div className="text-center p-3">
						<div className="text-lg font-bold text-gray-900">
							{students.filter((s) => s.trend === "up").length}
						</div>
						<div className="text-sm text-gray-600">Mejorando</div>
					</div>
					<div className="text-center p-3">
						<div className="text-lg font-bold text-gray-900">
							{students.filter((s) => s.grade >= 4.5).length}
						</div>
						<div className="text-sm text-gray-600">Excelentes</div>
					</div>
				</div>
			</div>
		</div>
	);
};
