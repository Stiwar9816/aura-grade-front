import React, {useState} from "react";
import Layout from "@/components/Layout";
import {ProtectedRoute} from "@/components/Auth";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";

const SettingsPage: React.FC = () => {
	const [notifications, setNotifications] = useState({
		email: true,
		push: false,
		submissions: true,
		grades: true,
	});

	const [privacy, setPrivacy] = useState({
		profileVisible: true,
		showEmail: false,
	});

	const [theme, setTheme] = useState("light");

	return (
		<ProtectedRoute>
			<Layout title="Configuración">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Notificaciones */}
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
										onChange={(e) =>
											setNotifications({
												...notifications,
												email: e.target.checked,
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
										onChange={(e) =>
											setNotifications({
												...notifications,
												push: e.target.checked,
											})
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
										checked={notifications.submissions}
										onChange={(e) =>
											setNotifications({
												...notifications,
												submissions: e.target.checked,
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
										onChange={(e) =>
											setNotifications({
												...notifications,
												grades: e.target.checked,
											})
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>
						</div>
					</Card>

					{/* Privacidad */}
					<Card>
						<SectionHeader
							title="Privacidad"
							description="Controla quién puede ver tu información"
							className="mb-6"
						/>

						<div className="space-y-4">
							<div className="flex items-center justify-between py-3 border-b border-gray-100">
								<div>
									<h4 className="font-medium text-gray-900">Perfil Visible</h4>
									<p className="text-sm text-gray-600">
										Permite que otros usuarios vean tu perfil
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={privacy.profileVisible}
										onChange={(e) =>
											setPrivacy({
												...privacy,
												profileVisible: e.target.checked,
											})
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>

							<div className="flex items-center justify-between py-3">
								<div>
									<h4 className="font-medium text-gray-900">Mostrar Email</h4>
									<p className="text-sm text-gray-600">
										Mostrar tu correo en tu perfil público
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={privacy.showEmail}
										onChange={(e) =>
											setPrivacy({
												...privacy,
												showEmail: e.target.checked,
											})
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-electric-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-500"></div>
								</label>
							</div>
						</div>
					</Card>

					{/* Apariencia */}
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
								<button
									onClick={() => setTheme("light")}
									className={`p-4 border-2 rounded-xl transition-all ${
										theme === "light"
											? "border-electric-500 bg-electric-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<div className="text-2xl mb-2">☀️</div>
									<div className="font-medium">Claro</div>
								</button>
								<button
									onClick={() => setTheme("dark")}
									className={`p-4 border-2 rounded-xl transition-all ${
										theme === "dark"
											? "border-electric-500 bg-electric-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<div className="text-2xl mb-2">🌙</div>
									<div className="font-medium">Oscuro</div>
								</button>
								<button
									onClick={() => setTheme("auto")}
									className={`p-4 border-2 rounded-xl transition-all ${
										theme === "auto"
											? "border-electric-500 bg-electric-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<div className="text-2xl mb-2">🔄</div>
									<div className="font-medium">Auto</div>
								</button>
							</div>
						</div>
					</Card>

					{/* Zona de Peligro */}
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
								<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
									Eliminar mi cuenta
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
