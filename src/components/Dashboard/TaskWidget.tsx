import React from "react";
import {Task} from "@/types";

interface TaskWidgetProps {
	tasks: Task[];
}

const TaskWidget: React.FC<TaskWidgetProps> = ({tasks}) => {
	const pendingTasks = tasks.filter((t) => t.status === "pending");
	const gradedTasks = tasks.filter((t) => t.status === "graded").slice(0, 3);

	return (
		<div className="card p-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold text-gray-900">Estado de Tareas</h2>
				<span className="bg-electric-100 text-electric-500 text-sm font-medium px-3 py-1 rounded-full">
					{pendingTasks.length} pendientes
				</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Tareas pendientes */}
				<div>
					<h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
						<span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
						Tareas Pendientes
					</h3>
					<div className="space-y-3">
						{pendingTasks.map((task) => (
							<div
								key={task.id}
								className="p-3 bg-orange-50 rounded-xl border border-orange-100"
							>
								<div className="flex justify-between items-start">
									<div>
										<h4 className="font-medium text-gray-900">{task.title}</h4>
										<p className="text-sm text-gray-600 mt-1">
											Vence:{" "}
											{new Date(task.dueDate).toLocaleDateString("es-ES", {
												day: "numeric",
												month: "short",
											})}
										</p>
									</div>
									<button className="text-electric-500 hover:text-electric-600 text-sm font-medium">
										Revisar →
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Calificaciones recientes */}
				<div>
					<h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
						<span className="w-2 h-2 bg-green-500 rounded-full"></span>
						Calificaciones Recientes
					</h3>
					<div className="space-y-3">
						{gradedTasks.map((task) => (
							<div
								key={task.id}
								className="p-3 bg-green-50 rounded-xl border border-green-100"
							>
								<div className="flex justify-between items-center">
									<div>
										<h4 className="font-medium text-gray-900">{task.title}</h4>
										<p className="text-sm text-gray-600 mt-1">Calificado</p>
									</div>
									<div className="text-right">
										<span className="text-2xl font-bold text-green-600">
											{task.score!.toFixed(1)}
										</span>
										<p className="text-xs text-gray-500">/{task.maxScore}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="mt-4 pt-4 border-t border-gray-100">
				<button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors text-sm">
					+ Ver todas las tareas
				</button>
			</div>
		</div>
	);
};

export default TaskWidget;
