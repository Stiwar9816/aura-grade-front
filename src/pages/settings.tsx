import React, {useEffect, useMemo, useState} from "react";
import {useMutation} from "@apollo/client/react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import {useAuth} from "@/hooks";
import {UPDATE_USER} from "@/gql/User";
import {UpdateUserInput, User} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate, faMoon, faSun} from "@fortawesome/free-solid-svg-icons";
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
	notifySuccess,
	notifyWarning,
} from "@/utils/toastNotify";

type NotificationSettings = {
	email: boolean;
	push: boolean;
	submissions: boolean;
	grades: boolean;
};

type PrivacySettings = {
	profileVisible: boolean;
	showEmail: boolean;
};

type AppSettings = {
	notifications: NotificationSettings;
	privacy: PrivacySettings;
	theme: ThemeSetting;
};

const defaultSettings: AppSettings = {
	notifications: {
		email: true,
		push: false,
		submissions: true,
		grades: true,
	},
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
	const settingsKey = useMemo(() => getSettingsKey(user?.id), [user?.id]);
	const [notifications, setNotifications] = useState<NotificationSettings>(
		defaultSettings.notifications,
	);
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
				notifications: {
					...defaultSettings.notifications,
					...savedSettings.notifications,
				},
				privacy: {
					...defaultSettings.privacy,
					...savedSettings.privacy,
				},
				theme: savedSettings.theme || defaultSettings.theme,
			};

			window.requestAnimationFrame(() => {
				setNotifications(nextSettings.notifications);
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

	const saveSettings = (nextSettings?: AppSettings) => {
		const settingsToSave = nextSettings || {notifications, privacy, theme};

		window.localStorage.setItem(settingsKey, JSON.stringify(settingsToSave));
		applyTheme(settingsToSave.theme);
		notifySettingsUpdated();
		notifySuccess("Configuración guardada correctamente.");
	};

	const resetSettings = () => {
		setNotifications(defaultSettings.notifications);
		setPrivacy(defaultSettings.privacy);
		setTheme(defaultSettings.theme);
		window.localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
		applyTheme(defaultSettings.theme);
		notifySettingsUpdated();
		notifyInfo("Configuración restaurada a los valores predeterminados.");
	};

	const handleThemeChange = (nextTheme: ThemeSetting) => {
		setTheme(nextTheme);
		applyTheme(nextTheme);
	};

	const handlePushToggle = async (checked: boolean) => {
		if (checked && typeof window !== "undefined" && "Notification" in window) {
			const permission = await Notification.requestPermission();

			if (permission !== "granted") {
				const message = "No se activaron las notificaciones push.";
				notifyWarning(message);
				setNotifications((current) => ({...current, push: false}));
				return;
			}
		}

		setNotifications((current) => ({...current, push: checked}));
		notifyInfo(
			checked
				? "Notificaciones push activadas. Guarda la configuración para conservar el cambio."
				: "Notificaciones push desactivadas. Guarda la configuración para conservar el cambio.",
		);
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

		try {
			await updateUserMutation({
				variables: {updateUserInput},
			});
			notifySuccess("Cuenta desactivada correctamente.");
			window.localStorage.removeItem(settingsKey);
			window.localStorage.removeItem("auraGrade_user");
			logout();
			window.location.href = "/login";
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "No se pudo desactivar la cuenta.";
			notifyError(message);
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
										checked={notifications.email}
										onChange={(event) =>
											setNotifications({
												...notifications,
												email: event.target.checked,
											})
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>

							<div className="flex items-center justify-between py-3 border-b border-gray-100">
								<div>
									<h4 className="font-medium text-gray-900">
										Notificaciones Push
									</h4>
									<p className="text-sm text-gray-600">
										Recibe notificaciones en el navegador
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={notifications.push}
										onChange={(event) => handlePushToggle(event.target.checked)}
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
										checked={notifications.submissions}
										onChange={(event) =>
											setNotifications({
												...notifications,
												submissions: event.target.checked,
											})
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
										checked={notifications.grades}
										onChange={(event) =>
											setNotifications({
												...notifications,
												grades: event.target.checked,
											})
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>
						</div>
					</Card>

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
							onClick={resetSettings}
							className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700"
						>
							Restaurar valores
						</button>
						<button
							type="button"
							onClick={() => saveSettings()}
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
