import {AssignmentCardProps} from "@/types";
import React, {useState, useEffect} from "react";

const AssignmentCard: React.FC<AssignmentCardProps> = ({
	assignment,
	onSelect,
}) => {
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [showRubric, setShowRubric] = useState<boolean>(false);

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date();
			const due = new Date(assignment.dueDate);
			const diff = due.getTime() - now.getTime();

			if (diff <= 0) {
				setTimeLeft("Vencido");
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

			if (days > 0) {
				setTimeLeft(`${days}d ${hours}h`);
			} else if (hours > 0) {
				setTimeLeft(`${hours}h ${minutes}m`);
			} else {
				setTimeLeft(`${minutes}m`);
			}
		};

		calculateTimeLeft();
		const interval = setInterval(calculateTimeLeft, 60000);

		return () => clearInterval(interval);
	}, [assignment.dueDate]);

	const getStatusConfig = () => {
		switch (assignment.status) {
			case "pending":
				const isOverdue =
					assignment.dueDate && new Date(assignment.dueDate) < new Date();
				return {
					label: isOverdue ? "Vencido" : "Pendiente",
					classes: isOverdue
						? "bg-red-50 text-red-600 ring-1 ring-red-100"
						: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
					icon: isOverdue ? "⚠️" : "⏳",
				};
			case "submitted":
				return {
					label: "Entregado",
					classes: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
					icon: "📤",
				};
			case "graded":
				return {
					label: "Calificado",
					classes: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
					icon: "✅",
				};
			default:
				return {
					label: "Pendiente",
					classes: "bg-gray-50 text-gray-600 ring-1 ring-gray-100",
					icon: "📄",
				};
		}
	};

	const status = getStatusConfig();

	return (
		<div className="group relative bg-white rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-electric-500/10 border border-gray-100 hover:border-gray-200 ring-1 ring-transparent hover:ring-electric-100 overflow-hidden">
			{/* Decorative background element */}
			<div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-electric-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			<div className="relative flex flex-col h-full">
				{/* Top Section: Status & Time */}
				<div className="flex items-center justify-between mb-5">
					<div
						className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${status.classes}`}
					>
						<span>{status.icon}</span>
						<span>{status.label}</span>
					</div>

					{assignment.status === "pending" && (
						<div className="flex flex-col items-end">
							<span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
								Faltan
							</span>
							<span
								className={`text-sm font-black italic ${
									timeLeft === "Vencido" ? "text-red-500" : "text-electric-500"
								}`}
							>
								{timeLeft}
							</span>
						</div>
					)}
				</div>

				{/* Title & Description */}
				<div className="mb-6 flex-1">
					<h3 className="text-xl font-bold text-gray-900 group-hover:text-electric-600 transition-colors leading-tight mb-2">
						{assignment.title}
					</h3>
					<p className="text-sm text-gray-500 line-clamp-2 font-medium">
						{assignment.description}
					</p>
				</div>

				{/* Middle Section: Rubric Quick View */}
				{showRubric && assignment.rubric && (
					<div className="mb-6 animate-slideIn">
						<div className="flex items-center gap-2 mb-3">
							<div className="w-1 h-4 bg-electric-500 rounded-full" />
							<span className="text-xs font-black uppercase text-gray-500 tracking-widest">
								Criterios Clave
							</span>
						</div>
						<div className="space-y-2">
							{assignment.rubric.criteria.slice(0, 3).map((c, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 border border-gray-100/50"
								>
									<span className="text-xs font-bold text-gray-700 truncate mr-2">
										{c.name}
									</span>
									<span className="text-[10px] font-black italic text-electric-500">
										{c.weight}%
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Bottom Section: Actions */}
				<div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
					<button
						onClick={() => setShowRubric(!showRubric)}
						className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
					>
						<span>{showRubric ? "Ocultar" : "Ver"} Rúbrica</span>
						<span
							className={`transition-transform duration-300 ${
								showRubric ? "rotate-180" : ""
							}`}
						>
							↓
						</span>
					</button>

					<div className="flex items-center gap-2">
						{assignment.status === "graded" && (
							<div className="mr-4 text-right">
								<span className="text-[9px] font-semibold uppercase text-gray-400 block tracking-tighter">
									Tu Nota
								</span>
								<span className="text-xl font-semibold text-emerald-500 leading-none">
									8.7
								</span>
							</div>
						)}

						<button
							onClick={() => onSelect(assignment)}
							className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
								assignment.status === "pending"
									? "bg-electric-500 text-white shadow-lg shadow-electric-500/20 hover:shadow-electric-500/40 hover:-translate-y-1 active:scale-95"
									: "bg-gray-50 text-gray-400 hover:bg-gray-100"
							}`}
							title={
								assignment.status === "pending"
									? "Entregar Tarea"
									: "Ver Detalle"
							}
						>
							<span className="text-lg">
								{assignment.status === "pending" ? "🚀" : "🔍"}
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssignmentCard;
