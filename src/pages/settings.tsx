import React, {useEffect, useMemo, useState} from "react";
import {useMutation} from "@apollo/client/react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import ActiveSessions from "@/components/Auth/ActiveSessions";
import {useAuth, useNotificationPreferences} from "@/hooks";
import {UPDATE_USER} from "@/gql/User";
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	UpdateUserInput,
	User,
} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate, faMoon, faSun} from "@fortawesome/free-solid-svg-icons";
import {
	subscribeToWebPush,
	supportsWebPush,
	unsubscribeFromWebPush,
} from "@/lib/pushNotifications";
import {
	DEFAULT_THEME,
	ThemeSetting,
	applyTheme,
	getSettingsKey,
	notifySettingsUpdated,
} from "@/utils/theme";
import {
	notifyError,
	notifyInfo,
	notifyLoading,
	notifySuccess,
	notifyWarning,
} from "@/utils/toastNotify";

type PrivacySettings = {
	profileVisible: boolean;
	showEmail: boolean;
};

type AppSettings = {
	privacy: PrivacySettings;
	theme: ThemeSetting;
};

const defaultSettings: AppSettings = {
	privacy: {
		profileVisible: true,
		showEmail: false,
	},
	theme: DEFAULT_THEME,
};

const SettingsPage: React.FC = () => {
	const {user, logout} = useAuth();
	const [updateUserMutation, {loading: deletingAccount}] = useMutation<{
		updateUser: User;
	}>(UPDATE_USER);
	const {
		preferences: notifications,
		setPreferences: setNotifications,
		savePreferences,
		loading: loadingNotifications,
		saving: savingNotifications,
		error: notificationPreferencesError,
	} = useNotificationPreferences(user?.id);
	const settingsKey = useMemo(() => getSettingsKey(user?.id), [user?.id]);
	const [privacy, setPrivacy] = useState<PrivacySettings>(
		defaultSettings.privacy,
	);
	const [theme, setTheme] = useState<ThemeSetting>(defaultSettings.theme);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");

	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			const rawSettings = window.localStorage.getItem(settingsKey);
			if (!rawSettings) {
				applyTheme(defaultSettings.theme);
				return;
			}

			const savedSettings = JSON.parse(rawSettings) as Partial<AppSettings>;
			const nextSettings: AppSettings = {
				privacy: {
					...defaultSettings.privacy,
					...savedSettings.privacy,
				},
				theme: savedSettings.theme || defaultSettings.theme,
			};

			window.requestAnimationFrame(() => {
				setPrivacy(nextSettings.privacy);
				setTheme(nextSettings.theme);
				applyTheme(nextSettings.theme);
			});
		} catch {
			window.requestAnimationFrame(() => {
				const message = "No se pudieron cargar tus preferencias guardadas.";
				notifyError(message);
			});
		}
	}, [settingsKey]);

	const saveSettings = async (nextSettings?: AppSettings) => {
		const settingsToSave = nextSettings || {privacy, theme};
		const notificationId = notifyLoading("Guardando configuración...");
		try {
			await savePreferences(notifications);
			window.localStorage.setItem(settingsKey, JSON.stringify(settingsToSave));
			applyTheme(settingsToSave.theme);
			notifySettingsUpdated();
			notifySuccess("Configuración guardada correctamente.", {
				id: notificationId,
			});
		} catch (error) {
			notifyError(
				error instanceof Error
					? error.message
					: "No fue posible guardar la configuración.",
				{id: notificationId},
			);
		}
	};

	const resetSettings = async () => {
		setNotifications(DEFAULT_NOTIFICATION_PREFERENCES);
		setPrivacy(defaultSettings.privacy);
		setTheme(defaultSettings.theme);
		const notificationId = notifyLoading("Restaurando configuración...");
		try {
			await unsubscribeFromWebPush().catch(() => undefined);
			await savePreferences(DEFAULT_NOTIFICATION_PREFERENCES);
			window.localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
			applyTheme(defaultSettings.theme);
			notifySettingsUpdated();
			notifyInfo("Configuración restaurada a los valores predeterminados.", {
				id: notificationId,
			});
		} catch (error) {
			notifyError(
				error instanceof Error
					? error.message
					: "No fue posible restaurar la configuración.",
				{id: notificationId},
			);
		}
	};

	const handleThemeChange = (nextTheme: ThemeSetting) => {
		setTheme(nextTheme);
		applyTheme(nextTheme);
	};

	const handlePushToggle = async (checked: boolean) => {
		if (checked && !supportsWebPush()) {
			notifyWarning("Este navegador no admite Web Push en un contexto seguro.");
			setNotifications((current) => ({...current, browserEnabled: false}));
			return;
		}

		if (!checked) {
			await unsubscribeFromWebPush().catch(() => undefined);
			setNotifications((current) => ({...current, browserEnabled: false}));
			notifyInfo(
				"Web Push se desactivó para este dispositivo. Guarda para aplicarlo a tu cuenta.",
			);
			return;
		}

		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			notifyWarning("El navegador no concedió permiso para Web Push.");
			setNotifications((current) => ({...current, browserEnabled: false}));
			return;
		}

		try {
			await subscribeToWebPush();
			setNotifications((current) => ({...current, browserEnabled: true}));
			notifyInfo(
				"Este dispositivo quedó suscrito. Guarda para activar Web Push en tu cuenta.",
			);
		} catch (error) {
			setNotifications((current) => ({...current, browserEnabled: false}));
			notifyError(
				error instanceof Error
					? error.message
					: "No fue posible suscribir este dispositivo.",
			);
		}
	};

	const handleDeleteAccount = async () => {
		if (deleteConfirmation !== "ELIMINAR") {
			const message = 'Escribe "ELIMINAR" para confirmar.';
			notifyWarning(message);
			return;
		}

		if (!user?.id) {
			const message = "No hay una sesión activa para desactivar.";
			notifyError(message);
			return;
		}

		const updateUserInput: UpdateUserInput = {
			id: user.id,
			isActive: false,
			role: user.role,
		};

		const notificationId = notifyLoading("Desactivando cuenta...");
		try {
			await updateUserMutation({
				variables: {updateUserInput},
			});
			notifySuccess("Cuenta desactivada correctamente.", {
				id: notificationId,
			});
			window.localStorage.removeItem(settingsKey);
			await logout();
			window.location.href = "/login";
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo desactivar la cuenta.";
			notifyError(message, {id: notificationId});
		}
	};

	return (
		<ProtectedRoute>
			<Layout title="Configuración">
				<div className="max-w-4xl mx-auto space-y-6">
					<Card>
						<SectionHeader
							title="Notificaciones"
							description="Gestiona cómo y cuándo recibes notificaciones"
							className="mb-6"
						/>
						{loadingNotifications && (
							<p className="mb-4 text-sm text-gray-500">
								Cargando preferencias de notificación...
							</p>
						)}
						{notificationPreferencesError && !loadingNotifications && (
							<p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
								{notificationPreferencesError}
							</p>
						)}

						<div className="space-y-4">
							<div className="flex items-center justify-between py-3 border-b border-gray-100">
								<div>
									<h4 className="font-medium text-gray-900">
										Notificaciones por Email
									</h4>
									<p className="text-sm text-gray-600">
										Recibe actualizaciones importantes por correo
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={notifications.emailEnabled}
										disabled={loadingNotifications || savingNotifications}
										aria-label="Activar notificaciones por correo"
										onChange={(event) =>
											setNotifications((current) => ({
												...current,
												emailEnabled: event.target.checked,
											}))
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>

							<div className="flex items-center justify-between py-3 border-b border-gray-100">
								<div>
									<h4 className="font-medium text-gray-900">
										Notificaciones del navegador
									</h4>
									<p className="text-sm text-gray-600">
										Recibe avisos incluso cuando Aura Grade está cerrado
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={notifications.browserEnabled}
										disabled={loadingNotifications || savingNotifications}
										aria-label="Activar notificaciones del navegador"
										onChange={(event) =>
											void handlePushToggle(event.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>

							<div className="flex items-center justify-between py-3 border-b border-gray-100">
								<div>
									<h4 className="font-medium text-gray-900">Nuevas Entregas</h4>
									<p className="text-sm text-gray-600">
										Notificar cuando haya nuevas entregas
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={notifications.newSubmissionsEnabled}
										disabled={loadingNotifications || savingNotifications}
										aria-label="Notificar nuevas entregas"
										onChange={(event) =>
											setNotifications((current) => ({
												...current,
												newSubmissionsEnabled: event.target.checked,
											}))
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>

							<div className="flex items-center justify-between py-3 border-b border-gray-100">
								<div>
									<h4 className="font-medium text-gray-900">
										Recordatorios de entrega
									</h4>
									<p className="text-sm text-gray-600">
										Avisar antes de que venzan tareas sin entregar
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={notifications.remindersEnabled}
										disabled={loadingNotifications || savingNotifications}
										aria-label="Notificar tareas próximas a vencer"
										onChange={(event) =>
											setNotifications((current) => ({
												...current,
												remindersEnabled: event.target.checked,
											}))
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>

							<div className="flex items-center justify-between py-3">
								<div>
									<h4 className="font-medium text-gray-900">Calificaciones</h4>
									<p className="text-sm text-gray-600">
										Notificar cuando recibas nuevas calificaciones
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={notifications.gradesEnabled}
										disabled={loadingNotifications || savingNotifications}
										aria-label="Notificar nuevas calificaciones"
										onChange={(event) =>
											setNotifications((current) => ({
												...current,
												gradesEnabled: event.target.checked,
											}))
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>
						</div>
					</Card>

					<ActiveSessions />

					<Card>
						<SectionHeader
							title="Apariencia"
							description="Personaliza la apariencia de la aplicación"
							className="mb-6"
						/>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Tema
							</label>
							<div className="grid grid-cols-3 gap-4">
								{[
									{
										id: "light",
										icon: <FontAwesomeIcon icon={faSun} />,
										label: "Claro",
									},
									{
										id: "dark",
										icon: <FontAwesomeIcon icon={faMoon} />,
										label: "Oscuro",
									},
									{
										id: "auto",
										icon: <FontAwesomeIcon icon={faArrowsRotate} />,
										label: "Auto",
									},
								].map((item) => (
									<button
										key={item.id}
										onClick={() => handleThemeChange(item.id as ThemeSetting)}
										className={`p-4 border-2 rounded-xl transition-all ${
											theme === item.id
												? "border-electric-500 bg-electric-50"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<div className="text-2xl mb-2">{item.icon}</div>
										<div className="font-medium">{item.label}</div>
									</button>
								))}
							</div>
						</div>
					</Card>

					<div className="flex flex-col sm:flex-row justify-end gap-3">
						<button
							type="button"
							onClick={() => void resetSettings()}
							disabled={loadingNotifications || savingNotifications}
							className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700"
						>
							Restaurar valores
						</button>
						<button
							type="button"
							onClick={() => void saveSettings()}
							disabled={loadingNotifications || savingNotifications}
							className="btn-primary"
						>
							Guardar configuración
						</button>
					</div>

					<Card className="border-red-200">
						<SectionHeader
							title="Zona de Peligro"
							description="Acciones irreversibles"
							className="mb-6"
						/>

						<div className="space-y-4">
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<h4 className="font-medium text-red-900 mb-2">
									Eliminar Cuenta
								</h4>
								<p className="text-sm text-red-700 mb-4">
									Una vez que elimines tu cuenta, no hay vuelta atrás. Por
									favor, asegúrate de esto.
								</p>
								<input
									type="text"
									value={deleteConfirmation}
									onChange={(event) =>
										setDeleteConfirmation(event.target.value)
									}
									placeholder='Escribe "ELIMINAR"'
									className="w-full max-w-xs px-4 py-2 border border-red-200 rounded-lg mb-4 focus:ring-2 focus:ring-red-200 focus:border-red-400"
								/>
								<button
									onClick={handleDeleteAccount}
									disabled={deletingAccount}
									className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-200"
								>
									{deletingAccount ? "Eliminando..." : "Eliminar mi cuenta"}
								</button>
							</div>
						</div>
					</Card>
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default SettingsPage;
