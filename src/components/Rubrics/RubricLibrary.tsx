import React, {useState} from "react";

interface RubricTemplate {
	id: string;
	name: string;
	description: string;
	criteriaCount: number;
	usedCount: number;
}

interface RubricLibraryProps {
	templates: RubricTemplate[];
	onSelectTemplate: (template: RubricTemplate) => void;
}

const RubricLibrary: React.FC<RubricLibraryProps> = ({
	templates,
	onSelectTemplate,
}) => {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<"all" | "popular" | "recent">("all");

	const filteredTemplates = templates.filter(
		(template) =>
			template.name.toLowerCase().includes(search.toLowerCase()) ||
			template.description.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Header y búsqueda */}
			<div className="card p-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
					<div>
						<h2 className="text-xl font-bold text-gray-900">
							Biblioteca de Rúbricas
						</h2>
						<p className="text-gray-600 mt-1">
							{templates.length} plantillas disponibles
						</p>
					</div>

					<div className="flex items-center gap-3">
						<div className="relative flex-1 md:w-64">
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Buscar rúbricas..."
								className="input-primary pl-10"
							/>
							<span className="absolute left-3 top-3 text-gray-400">🔍</span>
						</div>

						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value as any)}
							className="input-primary"
						>
							<option value="all">Todas</option>
							<option value="popular">Más usadas</option>
							<option value="recent">Recientes</option>
						</select>
					</div>
				</div>

				{/* Filter Pills */}
				<div className="flex flex-wrap gap-2">
					{[
						"Ensayo",
						"Proyecto",
						"Presentación",
						"Portafolio",
						"Investigación",
					].map((tag) => (
						<button
							key={tag}
							className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
						>
							{tag}
						</button>
					))}
				</div>
			</div>

			{/* Grid de plantillas */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredTemplates.map((template) => (
					<div
						key={template.id}
						className="card p-6 hover:shadow-lg transition-shadow group"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="p-3 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-xl">
								<span className="text-white text-xl">📋</span>
							</div>
							<span className="text-sm text-gray-500">
								{template.criteriaCount} criterios
							</span>
						</div>

						<h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-electric-500 transition-colors">
							{template.name}
						</h3>
						<p className="text-gray-600 text-sm mb-4">{template.description}</p>

						<div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
							<div className="flex items-center gap-2">
								<span className="text-gray-500 text-sm">Usada</span>
								<span className="font-bold text-electric-500">
									{template.usedCount} veces
								</span>
							</div>
							<button
								onClick={() => onSelectTemplate(template)}
								className="px-4 py-2 bg-electric-500 text-white rounded-lg hover:bg-electric-600 text-sm font-medium"
							>
								Usar Plantilla
							</button>
						</div>
					</div>
				))}
			</div>

			{filteredTemplates.length === 0 && (
				<div className="card p-12 text-center">
					<div className="text-4xl mb-4">🔍</div>
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						No se encontraron rúbricas
					</h3>
					<p className="text-gray-600 mb-6">
						No hay plantillas que coincidan con tu búsqueda
					</p>
					<button
						onClick={() => {
							setSearch("");
							setFilter("all");
						}}
						className="btn-ghost"
					>
						Limpiar filtros
					</button>
				</div>
			)}

			{/* Create New Section */}
			<div className="card p-8 text-center bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
				<div className="text-4xl mb-4">✨</div>
				<h3 className="text-xl font-bold text-gray-900 mb-2">
					¿No encuentras lo que necesitas?
				</h3>
				<p className="text-gray-600 mb-6 max-w-md mx-auto">
					Crea una rúbrica personalizada desde cero o importa desde Excel/CSV
				</p>
				<div className="flex gap-3 justify-center">
					<button className="btn-primary">
						<span className="flex items-center gap-2">
							<span>➕</span>
							<span>Crear desde cero</span>
						</span>
					</button>
					<button className="btn-ghost">
						<span className="flex items-center gap-2">
							<span>📊</span>
							<span>Importar CSV</span>
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default RubricLibrary;
