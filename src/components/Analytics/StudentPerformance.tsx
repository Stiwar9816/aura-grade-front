import React, {useState} from "react";

interface Student {
	id: string;
	name: string;
	grade: number;
	trend: "up" | "down" | "stable";
	riskLevel: "low" | "medium" | "high";
	criteria: {
		name: string;
		score: number;
		maxScore: number;
	}[];
}

const StudentPerformance: React.FC = () => {
	const [filter, setFilter] = useState<"all" | "risk" | "improving">("all");
	const [searchQuery, setSearchQuery] = useState("");

	const students: Student[] = [
		{
			id: "1",
			name: "María González",
			grade: 8.7,
			trend: "up",
			riskLevel: "low",
			criteria: [
				{name: "Crítica", score: 9.2, maxScore: 10},
				{name: "Técnica", score: 8.4, maxScore: 10},
				{name: "Sustento", score: 8.9, maxScore: 10},
			],
		},
		{
			id: "2",
			name: "Carlos Ruiz",
			grade: 6.2,
			trend: "down",
			riskLevel: "high",
			criteria: [
				{name: "Crítica", score: 5.4, maxScore: 10},
				{name: "Técnica", score: 7.1, maxScore: 10},
				{name: "Sustento", score: 6.2, maxScore: 10},
			],
		},
		{
			id: "3",
			name: "Ana Martínez",
			grade: 9.1,
			trend: "stable",
			riskLevel: "low",
			criteria: [
				{name: "Crítica", score: 9.6, maxScore: 10},
				{name: "Técnica", score: 9.0, maxScore: 10},
				{name: "Sustento", score: 8.8, maxScore: 10},
			],
		},
		{
			id: "4",
			name: "Luis Fernández",
			grade: 7.5,
			trend: "up",
			riskLevel: "medium",
			criteria: [
				{name: "Crítica", score: 7.8, maxScore: 10},
				{name: "Técnica", score: 7.4, maxScore: 10},
				{name: "Sustento", score: 7.2, maxScore: 10},
			],
		},
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
		const hue = Math.pow(score / 10, 1.5) * 140;
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
					<div className="relative">
						<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
							🔍
						</span>
						<input
							type="text"
							placeholder="Buscar estudiante..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-electric-500/20 focus:border-electric-500 transition-all outline-none font-medium"
						/>
					</div>

					<div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
						{[
							{id: "all", label: "Todos", color: "electric"},
							{id: "risk", label: "Foco Rojo", color: "red"},
							{id: "improving", label: "Mejorando", color: "green"},
						].map((btn) => (
							<button
								key={btn.id}
								onClick={() => setFilter(btn.id as any)}
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
									{student.grade.toFixed(1)}
								</div>
								<div className="text-[10px] font-bold text-gray-400 uppercase mt-1">
									Puntuación Total
								</div>
							</div>
						</div>

						<div className="space-y-3 pt-4 border-t border-gray-50">
							{student.criteria.map((c, idx) => (
								<div key={idx} className="group/bar">
									<div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1.5">
										<span>{c.name}</span>
										<span className="group-hover/bar:text-gray-900 transition-colors">
											{c.score}/10
										</span>
									</div>
									<div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
										<div
											className="h-full rounded-full transition-all duration-1000 group-hover/student:brightness-110"
											style={{
												width: `${(c.score / c.maxScore) * 100}%`,
												backgroundColor: getGradeHSL(c.score),
											}}
										/>
									</div>
								</div>
							))}
						</div>
						{/* 
						<div className="mt-5 flex gap-2">
							<button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-electric-600 bg-electric-50/50 rounded-xl hover:bg-electric-50 transition-colors">
								Historial
							</button>
							<button className="px-4 py-2 bg-gray-950 text-white rounded-xl hover:bg-black transition-transform hover:scale-[1.02] active:scale-95">
								<span className="text-xs">✉️</span>
							</button>
						</div> */}
					</div>
				))}
			</div>

			{filteredStudents.length === 0 && (
				<div className="text-center py-8">
					<div className="text-4xl mb-4">🎉</div>
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
							{students.filter((s) => s.grade >= 9).length}
						</div>
						<div className="text-sm text-gray-600">Excelentes</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StudentPerformance;
