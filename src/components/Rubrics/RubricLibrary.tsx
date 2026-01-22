import React, {useState} from "react";
import type {RubricLibraryProps} from "@/types";

export const RubricLibrary: React.FC<RubricLibraryProps> = ({
	templates,
	loading = false,
	error,
	onSelectTemplate,
	onDeleteTemplate,
	onCreateNew,
}) => {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<"all" | "popular" | "recent">("all");

	const filteredTemplates = templates.filter((template) =>
		template.title.toLowerCase().includes(search.toLowerCase()),
	);

	const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
		e.stopPropagation();
		if (
			window.confirm(
				`¿Estás seguro de que deseas eliminar la rúbrica "${title}"? Esta acción no se puede deshacer.`,
			)
		) {
			onDeleteTemplate(id);
		}
	};

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
						<button onClick={onCreateNew} className="btn-primary md:hidden">
							+
						</button>
						<div className="w-full md:w-80">
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Buscar rúbricas..."
								className="input-primary"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="card p-12 text-center">
					<div className="text-4xl mb-4">⏳</div>
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						Cargando rúbricas...
					</h3>
					<p className="text-gray-600">Por favor espera un momento</p>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="card p-12 text-center bg-red-50 border border-red-200">
					<div className="text-4xl mb-4">⚠️</div>
					<h3 className="text-xl font-bold text-red-900 mb-2">
						Error al cargar rúbricas
					</h3>
					<p className="text-red-600 mb-4">
						{error.message || "Ocurrió un error inesperado"}
					</p>
				</div>
			)}

			{/* Grid de plantillas */}
			{!loading && !error && (
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
								<span className="text-sm font-semibold text-electric-600">
									{template.maxTotalScore} pts
								</span>
							</div>

							<h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-electric-500 transition-colors">
								{template.title}
							</h3>
							<p className="text-gray-600 text-sm mb-4">
								{template.description}
							</p>

							<div className="flex items-center justify-between my-2 border-t border-gray-100 gap-3">
								<button
									onClick={(e) => handleDelete(e, template.id, template.title)}
									className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
									title="Eliminar rúbrica"
								>
									Eliminar
								</button>
								<button
									onClick={() => onSelectTemplate(template)}
									className="flex-1 px-4 py-2.5 bg-electric-500 text-white rounded-lg hover:bg-electric-600 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
									title="Usar plantilla"
								>
									Usar
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{!loading && !error && filteredTemplates.length === 0 && (
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
				<h3 className="text-xl font-bold text-gray-900 mb-2">
					¿No encuentras lo que necesitas?
				</h3>
				<p className="text-gray-600 mb-6 max-w-md mx-auto">
					Crea una rúbrica personalizada desde cero
				</p>
				<div className="flex gap-3 justify-center">
					<button onClick={onCreateNew} className="btn-primary">
						<span className="flex items-center gap-2">
							<span>Crear Rúbrica</span>
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};
