import React, {useEffect, useState} from "react";
import {useMutation} from "@apollo/client/react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import {useAuth} from "@/hooks";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import {UpdateUserInput, User, UserRole} from "@/interface";
import {UPDATE_USER} from "@/gql/User";

const getRoleLabel = (role?: UserRole) => {
	if (role === UserRole.STUDENT) return "Estudiante";
	if (role === UserRole.ADMIN) return "Administrador";
	return "Docente";
};

const ProfilePage: React.FC = () => {
	const {user, updateUser} = useAuth();
	const [updateUserMutation, {loading: savingProfile}] = useMutation<{
		updateUser: User;
	}>(UPDATE_USER);
	const [isEditing, setIsEditing] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.name || "",
				lastName: user.last_name || "",
				email: user.email,
				phone: user.phone?.toString() || "",
			});
		}
	}, [user]);

	const resetForm = () => {
		if (!user) return;

		setFormData({
			firstName: user.name || "",
			lastName: user.last_name || "",
			email: user.email,
			phone: user.phone?.toString() || "",
		});
		setStatusMessage(null);
	};

	const handleSave = async () => {
		if (!user?.id) {
			setStatusMessage({
				type: "error",
				text: "No hay una sesión activa para actualizar.",
			});
			return;
		}

		const firstName = formData.firstName.trim();
		const lastName = formData.lastName.trim();
		const cleanPhone = formData.phone.replace(/\s+/g, "");

		if (!firstName || !lastName) {
			setStatusMessage({
				type: "error",
				text: "Nombre y apellido son obligatorios.",
			});
			return;
		}

		if (cleanPhone && !/^\+?\d{7,15}$/.test(cleanPhone)) {
			setStatusMessage({
				type: "error",
				text: "Ingresa un teléfono válido entre 7 y 15 dígitos.",
			});
			return;
		}

		const updateUserInput: UpdateUserInput = {
			id: user.id,
			name: firstName,
			last_name: lastName,
			phone: cleanPhone ? Number(cleanPhone.replace(/^\+/, "")) : null,
			isActive: user.isActive ?? true,
			role: user.role,
		};

		try {
			const {data} = await updateUserMutation({
				variables: {updateUserInput},
			});
			const updatedUser = data?.updateUser;

			if (!updatedUser) {
				setStatusMessage({
					type: "error",
					text: "El servidor no retornó el usuario actualizado.",
				});
				return;
			}

			const result = updateUser?.({
				...updatedUser,
				role: user.role,
				token: user.token,
			});

			if (!result?.success) {
				setStatusMessage({
					type: "error",
					text: result?.error || "No se pudo actualizar la sesión local.",
				});
				return;
			}
		} catch (error) {
			setStatusMessage({
				type: "error",
				text:
					error instanceof Error
						? error.message
						: "No se pudo guardar el perfil.",
			});
			return;
		}

		setIsEditing(false);
		setStatusMessage({
			type: "success",
			text: "Perfil actualizado correctamente.",
		});
	};

	return (
		<ProtectedRoute>
			<Layout title="Mi Perfil">
				<div className="max-w-4xl mx-auto">
					<Card className="mb-6">
						<div className="flex items-center gap-6">
							<div className="w-24 h-24 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
								{user?.name?.charAt(0).toUpperCase()}
								{user?.last_name?.charAt(0).toUpperCase()}
							</div>
							<div className="flex-1">
								<h2 className="text-2xl font-bold text-gray-900">
									{user?.name} {user?.last_name}
								</h2>
								<p className="text-gray-600">{user?.email}</p>
								<div className="mt-2">
									<span
										className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
											user?.role === UserRole.STUDENT
												? "bg-green-100 text-green-800"
												: user?.role === UserRole.ADMIN
													? "bg-purple-100 text-purple-800"
													: "bg-blue-100 text-blue-800"
										}`}
									>
										{getRoleLabel(user?.role)}
									</span>
								</div>
							</div>
							<button
								onClick={() => {
									if (isEditing) resetForm();
									setIsEditing(!isEditing);
								}}
								className="btn-primary"
							>
								{isEditing ? "Cancelar" : "Editar Perfil"}
							</button>
						</div>
					</Card>

					<Card>
						<SectionHeader title="Información Personal" className="mb-6" />

						{statusMessage && (
							<div
								className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
									statusMessage.type === "success"
										? "bg-green-50 border-green-100 text-green-700"
										: "bg-red-50 border-red-100 text-red-700"
								}`}
							>
								{statusMessage.text}
							</div>
						)}

						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nombre
									</label>
									{isEditing ? (
										<input
											type="text"
											value={formData.firstName}
											onChange={(event) =>
												setFormData({
													...formData,
													firstName: event.target.value,
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
										Apellido
									</label>
									{isEditing ? (
										<input
											type="text"
											value={formData.lastName}
											onChange={(event) =>
												setFormData({
													...formData,
													lastName: event.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
										/>
									) : (
										<p className="text-gray-900 font-medium">
											{user?.last_name}
										</p>
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
											onChange={(event) =>
												setFormData({
													...formData,
													phone: event.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
											placeholder="Ej: +57 300 123 4567"
										/>
									) : (
										<p className="text-gray-900 font-medium">
											{user?.phone || "No especificado"}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Rol
									</label>
									<p className="text-gray-900 font-medium">
										{getRoleLabel(user?.role)}
									</p>
								</div>
							</div>

							{isEditing && (
								<div className="flex justify-end gap-3 pt-4 border-t">
									<button
										onClick={() => {
											resetForm();
											setIsEditing(false);
										}}
										className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
									>
										Cancelar
									</button>
									<button
										onClick={handleSave}
										disabled={savingProfile}
										className="btn-primary disabled:bg-gray-200 disabled:text-gray-400"
									>
										{savingProfile ? "Guardando..." : "Guardar Cambios"}
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
