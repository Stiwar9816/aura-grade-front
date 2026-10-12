import {AssignmentCardProps} from "@/types";
import {
	faCheck,
	faClock,
	faExclamationTriangle,
	faFileText,
	faSearch,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useState, useEffect} from "react";

const AssignmentCard: React.FC<AssignmentCardProps> = ({
	assignment,
	onSelect,
}) => {
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [showRubric, setShowRubric] = useState<boolean>(false);
	const submissionHistory = assignment.submissionHistory || [];

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
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
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
			case "overdue": {
				const isOverdue =
					assignment.dueDate && new Date(assignment.dueDate) < new Date();
				return {
					label: isOverdue ? "Vencido" : "Pendiente",
					classes: isOverdue
						? "bg-red-50 text-red-600 ring-1 ring-red-100"
						: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
					icon: isOverdue ? (
						<FontAwesomeIcon icon={faExclamationTriangle} />
					) : (
						<FontAwesomeIcon icon={faClock} />
					),
				};
			}
			case "submitted":
			case "review_pending":
				return {
					label: "En revisión",
					classes: "bg-violet-50 text-purple-700 ring-1 ring-violet-100",
					icon: <FontAwesomeIcon icon={faSearch} />,
				};
			case "graded":
				return {
					label: "Publicada",
					classes: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
					icon: <FontAwesomeIcon icon={faCheck} />,
				};
			default:
				return {
					label: "Pendiente",
					classes: "bg-gray-50 text-gray-600 ring-1 ring-gray-100",
					icon: <FontAwesomeIcon icon={faFileText} />,
				};
		}
	};

	const status = getStatusConfig();

	return (
		<div className="group bg-white rounded-xl p-4 sm:p-5 border border-gray-200 transition-colors hover:border-electric-300">

			<div className="relative flex flex-col h-full">
				{/* Top Section: Status & Time */}
				<div className="flex items-center justify-between mb-3">
					<div
						className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.classes}`}
					>
						<span>{status.icon}</span>
						<span>{status.label}</span>
					</div>

					{assignment.status === "pending" && (
						<div className="flex flex-col items-end">
							<span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
								Faltan
							</span>
							<span
								className={`text-sm font-semibold italic ${
									timeLeft === "Vencido" ? "text-red-500" : "text-electric-500"
								}`}
							>
								{timeLeft}
							</span>
						</div>
					)}
				</div>

				{submissionHistory.length > 0 && (
					<div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
						{submissionHistory.length}{" "}
						{submissionHistory.length === 1
							? "versión enviada"
							: "versiones enviadas"}
					</div>
				)}

				{/* Title & Description */}
				<div className="mb-4 flex-1">
					<h3 className="text-lg font-semibold text-gray-900 group-hover:text-electric-600 transition-colors leading-tight mb-2">
						{assignment.title}
					</h3>
					<p className="text-sm text-gray-500 line-clamp-2 font-medium">
						{assignment.description}
					</p>
				</div>

				{/* Middle Section: Rubric Quick View */}
				{showRubric && assignment.rubric && (
					<div id={`rubric-${assignment.id}`} className="mb-4">
						<div className="flex items-center gap-2 mb-3">
							<div className="w-1 h-4 bg-electric-500 rounded-full" />
							<span className="text-xs font-semibold uppercase text-gray-500 tracking-widest">
								Criterios de evaluación
							</span>
						</div>
						<div className="space-y-2">
							{assignment.rubric.criteria.map((c, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 border border-gray-100/50"
								>
									<span className="text-xs font-medium text-gray-700 mr-2">
										{c.name}
									</span>
									<span className="text-xs font-semibold italic text-electric-500">
										{c.weight}%
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Bottom Section: Actions */}
				<div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
					<button
                        type="button" aria-expanded={showRubric} aria-controls={`rubric-${assignment.id}`} disabled={!assignment.rubric}
						onClick={() => setShowRubric(!showRubric)}
						className="flex min-h-11 items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-widest"
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
								<span className="text-xs font-semibold uppercase text-gray-500 block tracking-tighter">
									Tu Nota
								</span>
								<span className="text-xl font-semibold text-gray-900 leading-none">
									{assignment.score?.toFixed(1) || "-"}
								</span>
								{assignment.maxScore && (
									<span className="text-xs font-semibold text-gray-500 block">
										/{assignment.maxScore}
									</span>
								)}
							</div>
						)}

                        <button type="button" onClick={() => onSelect(assignment)} className="min-h-11 rounded-lg border border-electric-200 bg-electric-50 px-3 text-sm font-semibold text-electric-700 hover:bg-electric-100">
                          {assignment.status === "pending" ? "Entregar" : assignment.status === "overdue" ? "Ver cierre" : assignment.status === "graded" ? "Ver nota" : "Ver entrega"}
                        </button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssignmentCard;
