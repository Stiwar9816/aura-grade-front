import React, {useState} from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import useAuth from "@/hooks/useAuth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";

const ProfilePage: React.FC = () => {
	const {user} = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: "",
		bio: "",
	});

	const handleSave = () => {
		// TODO: Implementar guardado de perfil
		setIsEditing(false);
	};

	return (
		<ProtectedRoute>
			<Layout title="Mi Perfil">
				<div className="max-w-4xl mx-auto">
					{/* Header con Avatar */}
					<Card className="mb-6">
						<div className="flex items-center gap-6">
							<div className="w-24 h-24 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
								{user?.name.charAt(0).toUpperCase()}
							</div>
							<div className="flex-1">
								<h2 className="text-2xl font-bold text-gray-900">
									{user?.name}
								</h2>
								<p className="text-gray-600">{user?.email}</p>
								<div className="mt-2">
									<span
										className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
											user?.role === "student"
												? "bg-green-100 text-green-800"
												: user?.role === "Administrador"
												? "bg-purple-100 text-purple-800"
												: "bg-blue-100 text-blue-800"
										}`}
									>
										{user?.role === "student"
											? "Estudiante"
											: user?.role === "Administrador"
											? "Administrador"
											: "Docente"}
									</span>
								</div>
							</div>
							<button
								onClick={() => setIsEditing(!isEditing)}
								className="btn-primary"
							>
								{isEditing ? "Cancelar" : "Editar Perfil"}
							</button>
						</div>
					</Card>

					{/* Información Personal */}
					<Card>
						<SectionHeader title="Información Personal" className="mb-6" />

						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nombre Completo
									</label>
									{isEditing ? (
										<input
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData({
													...formData,
													name: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
										/>
									) : (
										<p className="text-gray-900 font-medium">{user?.name}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Correo Electrónico
									</label>
									<p className="text-gray-900 font-medium">{user?.email}</p>
									<p className="text-xs text-gray-500 mt-1">
										El correo no se puede modificar
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Teléfono
									</label>
									{isEditing ? (
										<input
											type="tel"
											value={formData.phone}
											onChange={(e) =>
												setFormData({
													...formData,
													phone: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
											placeholder="Ej: +57 300 123 4567"
										/>
									) : (
										<p className="text-gray-900 font-medium">
											{formData.phone || "No especificado"}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Rol
									</label>
									<p className="text-gray-900 font-medium">
										{user?.role === "student"
											? "Estudiante"
											: user?.role === "Administrador"
											? "Administrador"
											: "Docente"}
									</p>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Biografía
								</label>
								{isEditing ? (
									<textarea
										value={formData.bio}
										onChange={(e) =>
											setFormData({
												...formData,
												bio: e.target.value,
											})
										}
										rows={4}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
										placeholder="Cuéntanos un poco sobre ti..."
									/>
								) : (
									<p className="text-gray-900">
										{formData.bio || "No has agregado una biografía aún."}
									</p>
								)}
							</div>

							{isEditing && (
								<div className="flex justify-end gap-3 pt-4 border-t">
									<button
										onClick={() => setIsEditing(false)}
										className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
									>
										Cancelar
									</button>
									<button onClick={handleSave} className="btn-primary">
										Guardar Cambios
									</button>
								</div>
							)}
						</div>
					</Card>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default ProfilePage;
