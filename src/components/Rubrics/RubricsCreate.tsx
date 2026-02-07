import React, {useState} from "react";
import {RubricsCreateProps} from "@/types";

export const RubricsCreate: React.FC<RubricsCreateProps> = ({onStart}) => {
	const [data, setData] = useState({
		title: "",
		description: "",
	});

	const [loading, setLoading] = useState(false);

	const handleStart = async () => {
		if (data.title && !loading) {
			setLoading(true);
			try {
				await onStart(data);
			} finally {
				setLoading(false);
			}
		}
	};

	return (
		<div className="max-w-2xl mx-auto card p-8">
			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold text-gray-900">
					Crear Nueva Rúbrica
				</h2>
				<p className="text-gray-600 mt-2">
					Define los detalles básicos para comenzar
				</p>
			</div>

			<div className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Título de la Rúbrica
					</label>
					<input
						type="text"
						value={data.title}
						onChange={(e) => setData({...data, title: e.target.value})}
						className="input-primary"
						placeholder="Ej: Evaluación de Ensayo Argumentativo"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Descripción (Opcional)
					</label>
					<textarea
						value={data.description}
						onChange={(e) => setData({...data, description: e.target.value})}
						rows={4}
						className="input-primary"
						placeholder="Describe el propósito de esta evaluación..."
					/>
				</div>

				<div className="pt-2">
					<button
						onClick={handleStart}
						disabled={!data.title || loading}
						className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
							data.title && !loading
								? "bg-electric-500 text-white hover:bg-electric-600 shadow-electric-200"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						{loading ? "Iniciando..." : "Comenzar a Añadir Criterios →"}
					</button>
				</div>
			</div>
		</div>
	);
};
