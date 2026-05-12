import React, {useState} from "react";
import type {RubricLibraryProps, RubricTemplate} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faExclamationTriangle,
	faFileText,
	faSearch,
} from "@fortawesome/free-solid-svg-icons";

export const RubricLibrary: React.FC<RubricLibraryProps> = ({
	templates,
	loading = false,
	error,
	onSelectTemplate,
	onDeleteTemplate,
	onCreateNew,
}) => {
	const [search, setSearch] = useState("");
	const errorMessage =
		error instanceof Error
			? error.message
			: typeof error === "string"
				? error
				: "Ocurrió un error inesperado";

	const filteredTemplates = templates.filter((template: RubricTemplate) =>
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
			{Boolean(error) && (
				<div className="card p-12 text-center bg-red-50 border border-red-200">
					<div className="text-4xl mb-4">
						<FontAwesomeIcon icon={faExclamationTriangle} />
					</div>
					<h3 className="text-xl font-bold text-red-900 mb-2">
						Error al cargar rúbricas
					</h3>
					<p className="text-red-600 mb-4">{errorMessage}</p>
				</div>
			)}

			{/* Grid de plantillas */}
			{!loading && !error && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredTemplates.map((template: RubricTemplate) => (
						<div
							key={template.id}
							className="card p-6 hover:shadow-lg transition-shadow group h-full min-h-[260px] flex flex-col"
						>
							<div className="flex items-start justify-between gap-4 mb-4">
								<div className="p-3 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-xl">
									<span className="text-white text-xl">
										<FontAwesomeIcon icon={faFileText} />
									</span>
								</div>
								<span className="shrink-0 text-sm font-semibold text-electric-600">
									{template.maxTotalScore} pts
								</span>
							</div>

							<h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-electric-500 transition-colors line-clamp-2 min-h-[3.5rem]">
								{template.title}
							</h3>
							<p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[3.75rem]">
								{template.description}
							</p>

							<div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
								<button
									onClick={(e) => handleDelete(e, template.id, template.title)}
									className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
									title="Eliminar rúbrica"
								>
									Eliminar
								</button>
								<button
									onClick={() => onSelectTemplate(template)}
									className="w-full px-4 py-2.5 bg-electric-500 text-white rounded-lg hover:bg-electric-600 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
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
					<div className="text-4xl mb-4">
						<FontAwesomeIcon icon={faSearch} />
					</div>
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						No se encontraron rúbricas
					</h3>
					<p className="text-gray-600 mb-6">
						No hay plantillas que coincidan con tu búsqueda
					</p>
					<button
						onClick={() => {
							setSearch("");
						}}
						className="btn-ghost"
					>
						Limpiar filtros
					</button>
				</div>
			)}
		</div>
	);
};
