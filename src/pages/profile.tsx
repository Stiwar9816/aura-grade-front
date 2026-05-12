import React, {useEffect, useState} from "react";
import {useMutation} from "@apollo/client/react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import {useAuth} from "@/hooks";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import {UpdateUserInput, User, UserRole} from "@/interface";
import {RESET_PASSWORD_AUTH, UPDATE_USER} from "@/gql/User";
import {notifyError, notifySuccess, notifyWarning} from "@/utils/toastNotify";

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
	const [resetPasswordAuthMutation, {loading: savingPassword}] = useMutation<
		{resetPasswordAuth: User},
		{newPassword: string}
	>(RESET_PASSWORD_AUTH);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
	});
	const [passwordData, setPasswordData] = useState({
		newPassword: "",
		confirmPassword: "",
	});

	useEffect(() => {
		if (user) {
			window.requestAnimationFrame(() => {
				setFormData({
					firstName: user.name || "",
					lastName: user.last_name || "",
					email: user.email,
					phone: user.phone?.toString() || "",
				});
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
	};

	const handleSave = async () => {
		if (!user?.id) {
			const message = "No hay una sesión activa para actualizar.";
			notifyError(message);
			return;
		}

		const firstName = formData.firstName.trim();
		const lastName = formData.lastName.trim();
		const cleanPhone = formData.phone.replace(/\s+/g, "");

		if (!firstName || !lastName) {
			const message = "Nombre y apellido son obligatorios.";
			notifyWarning(message);
			return;
		}

		if (cleanPhone && !/^\+?\d{7,10}$/.test(cleanPhone)) {
			const message = "Ingresa un teléfono válido entre 7 y 10 dígitos.";
			notifyWarning(message);
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
				const message = "El servidor no retornó el usuario actualizado.";
				notifyError(message);
				return;
			}

			const result = updateUser?.({
				...updatedUser,
				role: user.role,
				token: user.token,
			});

			if (!result?.success) {
				const message =
					result?.error || "No se pudo actualizar la sesión local.";
				notifyError(message);
				return;
			}
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo guardar el perfil.";
			notifyError(message);
			return;
		}

		setIsEditing(false);
		notifySuccess("Perfil actualizado correctamente.");
	};

	const handlePasswordSave = async (event?: React.FormEvent) => {
		event?.preventDefault();
		const newPassword = String(passwordData.newPassword || "").trim();
		const confirmPassword = String(passwordData.confirmPassword || "").trim();

		if (!newPassword || !confirmPassword) {
			notifyWarning("Ingresa y confirma la nueva contraseña.");
			return;
		}

		if (newPassword.length < 8) {
			notifyWarning("La contraseña debe tener al menos 8 caracteres.");
			return;
		}

		if (newPassword !== confirmPassword) {
			notifyWarning("Las contraseñas no coinciden.");
			return;
		}

		try {
			const {data} = await resetPasswordAuthMutation({
				variables: {newPassword},
			});

			if (!data?.resetPasswordAuth) {
				notifyError("El servidor no confirmó el cambio de contraseña.");
				return;
			}

			setPasswordData({newPassword: "", confirmPassword: ""});
			notifySuccess("Contraseña actualizada correctamente.");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo actualizar la contraseña.";
			notifyError(message);
		}
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

					<Card className="mt-6">
						<SectionHeader title="Seguridad" className="mb-6" />

						<form onSubmit={handlePasswordSave} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nueva contraseña
									</label>
									<input
										type="password"
										value={passwordData.newPassword}
										onChange={(event) =>
											setPasswordData({
												...passwordData,
												newPassword: event.currentTarget.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
										placeholder="Mínimo 8 caracteres"
										autoComplete="new-password"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Confirmar contraseña
									</label>
									<input
										type="password"
										value={passwordData.confirmPassword}
										onChange={(event) =>
											setPasswordData({
												...passwordData,
												confirmPassword: event.currentTarget.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
										placeholder="Repite la nueva contraseña"
										autoComplete="new-password"
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t">
								<button
									type="button"
									onClick={() =>
										setPasswordData({newPassword: "", confirmPassword: ""})
									}
									disabled={savingPassword}
									className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
								>
									Limpiar
								</button>
								<button
									type="submit"
									disabled={savingPassword}
									className="btn-primary disabled:bg-gray-200 disabled:text-gray-400"
								>
									{savingPassword ? "Actualizando..." : "Actualizar contraseña"}
								</button>
							</div>
						</form>
					</Card>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default ProfilePage;
