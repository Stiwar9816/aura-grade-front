import React, {useState} from "react";

interface Suggestion {
	id: string;
	type: "grammar" | "style" | "structure" | "content";
	text: string;
	suggestion: string;
	severity: "low" | "medium" | "high";
}

interface SuggestionPanelProps {
	suggestions: Suggestion[];
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({suggestions}) => {
	const [filter, setFilter] = useState<string>("all");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const filteredSuggestions =
		filter === "all"
			? suggestions
			: suggestions.filter((s) => s.type === filter);

	const getTypeConfig = (type: string) => {
		switch (type) {
			case "grammar":
				return {color: "red", icon: "🔤", label: "Gramática"};
			case "style":
				return {color: "blue", icon: "🎨", label: "Estilo"};
			case "structure":
				return {color: "purple", icon: "🏗️", label: "Estructura"};
			case "content":
				return {color: "green", icon: "📝", label: "Contenido"};
			default:
				return {color: "gray", icon: "💬", label: "General"};
		}
	};

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "high":
				return "text-red-600 bg-red-50 border-red-200";
			case "medium":
				return "text-yellow-600 bg-yellow-50 border-yellow-200";
			case "low":
				return "text-green-600 bg-green-50 border-green-200";
			default:
				return "text-gray-600 bg-gray-50 border-gray-200";
		}
	};

	return (
		<div className="card p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-xl font-bold text-gray-900">
						Sugerencias de Mejora
					</h2>
					<p className="text-gray-600 mt-1">
						{suggestions.length} sugerencias detectadas por IA
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600">Filtrar:</span>
					<select
						className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
					>
						<option value="all">Todas</option>
						<option value="grammar">Gramática</option>
						<option value="style">Estilo</option>
						<option value="structure">Estructura</option>
						<option value="content">Contenido</option>
					</select>
				</div>
			</div>

			{/* Filter Pills */}
			<div className="flex flex-wrap gap-2 mb-6">
				{["all", "grammar", "style", "structure", "content"].map((type) => {
					const config = getTypeConfig(type);
					return (
						<button
							key={type}
							onClick={() => setFilter(type)}
							className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
								filter === type
									? `bg-${config.color}-500 text-white`
									: `bg-${config.color}-100 text-${config.color}-700 hover:bg-${config.color}-200`
							}`}
						>
							<span>{config.icon}</span>
							<span>{config.label}</span>
							{type !== "all" && (
								<span
									className={`px-2 py-0.5 rounded-full text-xs ${
										filter === type ? "bg-white/30" : `bg-${config.color}-200`
									}`}
								>
									{suggestions.filter((s) => s.type === type).length}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Suggestions List */}
			<div className="space-y-4">
				{filteredSuggestions.map((suggestion) => {
					const typeConfig = getTypeConfig(suggestion.type);
					const isExpanded = expandedId === suggestion.id;

					return (
						<div
							key={suggestion.id}
							className={`border rounded-xl overflow-hidden transition-all duration-300 ${
								isExpanded ? "border-gray-300" : "border-gray-200"
							}`}
						>
							<div
								className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
								onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={`p-2 bg-${typeConfig.color}-100 rounded-lg`}
										>
											<span className={`text-${typeConfig.color}-600`}>
												{typeConfig.icon}
											</span>
										</div>
										<div>
											<h3 className="font-medium text-gray-900">
												{suggestion.text}
											</h3>
											<div className="flex items-center gap-3 mt-1">
												<span className="text-sm text-gray-600">
													{typeConfig.label}
												</span>
												<span
													className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(
														suggestion.severity
													)}`}
												>
													{suggestion.severity === "high"
														? "Alta"
														: suggestion.severity === "medium"
														? "Media"
														: "Baja"}
												</span>
											</div>
										</div>
									</div>
									<div className="text-gray-500">{isExpanded ? "▲" : "▼"}</div>
								</div>
							</div>

							{isExpanded && (
								<div className="border-t border-gray-200 p-4 bg-gray-50">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<h4 className="font-medium text-gray-900 mb-2">
												Problema Detectado
											</h4>
											<div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-700">
												{suggestion.text}
											</div>
										</div>
										<div>
											<h4 className="font-medium text-gray-900 mb-2">
												Sugerencia IA
											</h4>
											<div className="bg-green-50 border border-green-200 rounded-lg p-3 text-gray-700">
												{suggestion.suggestion}
											</div>
										</div>
									</div>

									<div className="mt-4 pt-4 border-t border-gray-200">
										<div className="flex justify-end gap-3">
											<button className="text-sm text-gray-600 hover:text-gray-900">
												Ignorar
											</button>
											<button className="text-sm text-electric-500 hover:text-electric-600 font-medium">
												Aplicar Cambio
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Summary */}
			<div className="mt-6 pt-6 border-t border-gray-200">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-3">
						<div
							className={`text-2xl font-bold ${
								suggestions.filter((s) => s.severity === "high").length > 0
									? "text-red-600"
									: "text-green-600"
							}`}
						>
							{suggestions.filter((s) => s.severity === "high").length}
						</div>
						<div className="text-sm text-gray-600 mt-1">Críticas Altas</div>
					</div>
					<div className="text-center p-3">
						<div className="text-2xl font-bold text-yellow-600">
							{suggestions.filter((s) => s.severity === "medium").length}
						</div>
						<div className="text-sm text-gray-600 mt-1">Críticas Medias</div>
					</div>
					<div className="text-center p-3">
						<div className="text-2xl font-bold text-blue-600">
							{suggestions.filter((s) => s.type === "grammar").length}
						</div>
						<div className="text-sm text-gray-600 mt-1">Gramática</div>
					</div>
					<div className="text-center p-3">
						<div className="text-2xl font-bold text-purple-600">
							{suggestions.filter((s) => s.type === "structure").length}
						</div>
						<div className="text-sm text-gray-600 mt-1">Estructura</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SuggestionPanel;
