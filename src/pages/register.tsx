import React, {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import {RegisterFormData} from "@/types";
import useAuth from "@/hooks/useAuth";
import AuthLayout from "@/components/Auth/AuthLayout";

const RegisterPage: React.FC = () => {
	const router = useRouter();
	const {
		register: registerUser,
		isLoading: isRegistering,
		error: authError,
	} = useAuth();
	const [step, setStep] = useState<number>(1);
	const [formData, setFormData] = useState<RegisterFormData>({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		userType: "student",
		acceptTerms: false,
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof RegisterFormData, string>>
	>({});
	const [showPassword, setShowPassword] = useState(false);

	const validateStep = (stepNumber: number): boolean => {
		const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

		if (stepNumber === 1) {
			if (!formData.firstName.trim())
				newErrors.firstName = "El nombre es requerido";
			if (!formData.lastName.trim())
				newErrors.lastName = "El apellido es requerido";
			if (!formData.email.trim()) {
				newErrors.email = "El correo electrónico es requerido";
			} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
				newErrors.email = "El correo electrónico no es válido";
			}
			if (!formData.userType)
				newErrors.userType = "Debes seleccionar un tipo de usuario";
		}

		if (stepNumber === 2) {
			if (!formData.password) {
				newErrors.password = "La contraseña es requerida";
			} else if (formData.password.length < 8) {
				newErrors.password = "La contraseña debe tener al menos 8 caracteres";
			} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
				newErrors.password = "Debe incluir mayúsculas, minúsculas y números";
			}

			if (!formData.confirmPassword) {
				newErrors.confirmPassword = "Confirma tu contraseña";
			} else if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = "Las contraseñas no coinciden";
			}
		}

		if (stepNumber === 3) {
			if (!formData.acceptTerms) {
				newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNextStep = () => {
		if (validateStep(step)) {
			if (step < 3) {
				setStep(step + 1);
			} else {
				handleSubmit();
			}
		}
	};

	const handlePreviousStep = () => {
		if (step > 1) {
			setStep(step - 1);
		}
	};

	const handleSubmit = async () => {
		const {success, error} = await registerUser({
			firstName: formData.firstName,
			lastName: formData.lastName,
			email: formData.email,
			password: formData.password,
			userType: formData.userType as "student" | "teacher",
		});

		if (!success && error) {
			setErrors({email: error});
		}
	};

	const getPasswordStrength = (password: string) => {
		if (!password) return {score: 0, label: "", color: "bg-gray-200"};

		let score = 0;
		if (password.length >= 8) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;

		const strengths = [
			{score: 0, label: "Muy débil", color: "bg-red-500"},
			{score: 1, label: "Débil", color: "bg-orange-500"},
			{score: 2, label: "Regular", color: "bg-yellow-500"},
			{score: 3, label: "Buena", color: "bg-blue-500"},
			{score: 4, label: "Fuerte", color: "bg-green-500"},
			{score: 5, label: "Muy fuerte", color: "bg-emerald-500"},
		];

		return strengths[score] || strengths[0];
	};

	const passwordStrength = getPasswordStrength(formData.password);

	const features = [
		{
			icon: "👨‍🎓",
			title: "Panel de Estudiante",
			description: "Accede a tus tareas y recibe feedback en tiempo real",
			gradient: "from-cyan-500 to-blue-500",
		},
		{
			icon: "👨‍🏫",
			title: "Herramientas de Docente",
			description: "Gestiona rúbricas y automatiza evaluaciones con precisión",
			gradient: "from-purple-500 to-electric-500",
		},
		{
			icon: "🛡️",
			title: "Seguro y Privado",
			description: "Tus datos y trabajos están protegidos con encriptación",
			gradient: "from-emerald-500 to-green-500",
		},
	];

	return (
		<AuthLayout
			title="Crea tu cuenta"
			subtitle="Únete a la nueva era de la evaluación educativa"
			features={features}
			heroTitle={
				<>
					Empieza tu viaje <span className="text-electric-500">educativo</span>
				</>
			}
		>
			{/* Steps Indicator */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-bold text-electric-500 uppercase tracking-widest">
						Paso {step} de 3
					</span>
					<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
						{step === 1
							? "Información"
							: step === 2
							? "Seguridad"
							: "Finalizar"}
					</span>
				</div>
				<div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
					<div
						className="h-full bg-electric-500 transition-all duration-500 ease-out"
						style={{width: `${(step / 3) * 100}%`}}
					/>
				</div>
			</div>

			{authError && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
					<div className="flex items-center gap-3">
						<span className="text-red-600">⚠️</span>
						<span className="text-red-700">{authError}</span>
					</div>
				</div>
			)}
			{/* Step 1: Personal Info */}
			{step === 1 && (
				<div className="space-y-6">
					<div>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							Información personal
						</h2>
						<p className="text-gray-600">Comencemos con tus datos básicos</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Nombre *
							</label>
							<input
								type="text"
								value={formData.firstName}
								onChange={(e) =>
									setFormData({...formData, firstName: e.target.value})
								}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.firstName
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="Ej: María"
							/>
							{errors.firstName && (
								<p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Apellido *
							</label>
							<input
								type="text"
								value={formData.lastName}
								onChange={(e) =>
									setFormData({...formData, lastName: e.target.value})
								}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.lastName
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="Ej: González"
							/>
							{errors.lastName && (
								<p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
							)}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Correo electrónico *
						</label>
						<input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({...formData, email: e.target.value})
							}
							className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
								errors.email
									? "border-red-500"
									: "border-gray-300 focus:border-electric-500"
							}`}
							placeholder="tu@email.com"
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-4">
							¿Cómo usarás AuraGrade? *
						</label>
						<div className="grid grid-cols-1 gap-4">
							<button
								type="button"
								onClick={() => setFormData({...formData, userType: "student"})}
								className={`p-4 border-2 rounded-xl text-left transition-all ${
									formData.userType === "student"
										? "border-electric-500 bg-electric-50"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${
											formData.userType === "student"
												? "bg-electric-100"
												: "bg-gray-100"
										}`}
									>
										<span className="text-xl">👨‍🎓</span>
									</div>
									<div>
										<div className="font-semibold text-gray-900">
											Como Estudiante
										</div>
										<div className="text-sm text-gray-600 mt-1">
											Entregar tareas y recibir feedback de IA
										</div>
									</div>
								</div>
							</button>

							<button
								type="button"
								onClick={() => setFormData({...formData, userType: "teacher"})}
								className={`p-4 border-2 rounded-xl text-left transition-all ${
									formData.userType === "teacher"
										? "border-electric-500 bg-electric-50"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${
											formData.userType === "teacher"
												? "bg-electric-100"
												: "bg-gray-100"
										}`}
									>
										<span className="text-xl">👨‍🏫</span>
									</div>
									<div>
										<div className="font-semibold text-gray-900">
											Como Docente
										</div>
										<div className="text-sm text-gray-600 mt-1">
											Evaluar trabajos y analizar progreso
										</div>
									</div>
								</div>
							</button>
						</div>
						{errors.userType && (
							<p className="mt-2 text-sm text-red-600">{errors.userType}</p>
						)}
					</div>
				</div>
			)}

			{/* Step 2: Security */}
			{step === 2 && (
				<div className="space-y-6">
					<div>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							Seguridad de tu cuenta
						</h2>
						<p className="text-gray-600">
							Crea una contraseña segura para proteger tu cuenta
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Contraseña *
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={formData.password}
								onChange={(e) =>
									setFormData({...formData, password: e.target.value})
								}
								className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.password
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center"
							>
								{showPassword ? (
									<svg
										className="h-5 w-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								) : (
									<svg
										className="h-5 w-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								)}
							</button>
						</div>
						{errors.password && (
							<p className="mt-1 text-sm text-red-600">{errors.password}</p>
						)}

						{/* Password Strength */}
						{formData.password && (
							<div className="mt-3">
								<div className="flex items-center justify-between mb-1">
									<span className="text-sm text-gray-700">
										Seguridad de la contraseña:
									</span>
									<span
										className={`text-sm font-medium ${
											passwordStrength.color === "bg-green-500" ||
											passwordStrength.color === "bg-emerald-500"
												? "text-green-600"
												: passwordStrength.color === "bg-blue-500"
												? "text-blue-600"
												: passwordStrength.color === "bg-yellow-500"
												? "text-yellow-600"
												: passwordStrength.color === "bg-orange-500"
												? "text-orange-600"
												: "text-red-600"
										}`}
									>
										{passwordStrength.label}
									</span>
								</div>
								<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										className={`h-full ${passwordStrength.color} transition-all duration-300`}
										style={{
											width: `${(passwordStrength.score / 5) * 100}%`,
										}}
									/>
								</div>
								<ul className="mt-2 space-y-1 text-sm text-gray-600">
									<li className="flex items-center gap-2">
										<span
											className={
												formData.password.length >= 8
													? "text-green-500"
													: "text-gray-400"
											}
										>
											{formData.password.length >= 8 ? "✓" : "○"}
										</span>
										<span>Al menos 8 caracteres</span>
									</li>
									<li className="flex items-center gap-2">
										<span
											className={
												/[a-z]/.test(formData.password)
													? "text-green-500"
													: "text-gray-400"
											}
										>
											{/[a-z]/.test(formData.password) ? "✓" : "○"}
										</span>
										<span>Una letra minúscula</span>
									</li>
									<li className="flex items-center gap-2">
										<span
											className={
												/[A-Z]/.test(formData.password)
													? "text-green-500"
													: "text-gray-400"
											}
										>
											{/[A-Z]/.test(formData.password) ? "✓" : "○"}
										</span>
										<span>Una letra mayúscula</span>
									</li>
									<li className="flex items-center gap-2">
										<span
											className={
												/\d/.test(formData.password)
													? "text-green-500"
													: "text-gray-400"
											}
										>
											{/\d/.test(formData.password) ? "✓" : "○"}
										</span>
										<span>Un número</span>
									</li>
								</ul>
							</div>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Confirmar contraseña *
						</label>
						<input
							type="password"
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({
									...formData,
									confirmPassword: e.target.value,
								})
							}
							className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
								errors.confirmPassword
									? "border-red-500"
									: "border-gray-300 focus:border-electric-500"
							}`}
							placeholder="••••••••"
						/>
						{errors.confirmPassword && (
							<p className="mt-1 text-sm text-red-600">
								{errors.confirmPassword}
							</p>
						)}
					</div>
				</div>
			)}

			{/* Step 3: Confirmation */}
			{step === 3 && (
				<div className="space-y-6">
					<div>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							Últimos detalles
						</h2>
						<p className="text-gray-600">Revisa y confirma tu información</p>
					</div>

					{/* Summary Card */}
					<div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
						<h3 className="font-semibold text-gray-900 mb-4">
							Resumen de tu cuenta
						</h3>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-sm text-gray-600">Nombre completo</div>
									<div className="font-medium text-gray-900">
										{formData.firstName} {formData.lastName}
									</div>
								</div>
								<div>
									<div className="text-sm text-gray-600">Tipo de usuario</div>
									<div className="font-medium text-gray-900">
										{formData.userType === "student"
											? "👨‍🎓 Estudiante"
											: "👨‍🏫 Docente"}
									</div>
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-600">Correo electrónico</div>
								<div className="font-medium text-gray-900">
									{formData.email}
								</div>
							</div>
						</div>
					</div>

					{/* Terms and Conditions */}
					<div className="space-y-4">
						<label className="flex items-start gap-3">
							<input
								type="checkbox"
								checked={formData.acceptTerms}
								onChange={(e) =>
									setFormData({
										...formData,
										acceptTerms: e.target.checked,
									})
								}
								className="mt-1 h-4 w-4 text-electric-500 rounded border-gray-300 focus:ring-electric-200"
							/>
							<div>
								<span className="text-sm text-gray-700">
									Acepto los{" "}
									<Link
										href="/terms"
										className="text-electric-500 hover:text-electric-600 font-medium"
									>
										Términos de Servicio
									</Link>{" "}
									y la{" "}
									<Link
										href="/privacy"
										className="text-electric-500 hover:text-electric-600 font-medium"
									>
										Política de Privacidad
									</Link>{" "}
									de AuraGrade *
								</span>
								{errors.acceptTerms && (
									<p className="mt-1 text-sm text-red-600">
										{errors.acceptTerms}
									</p>
								)}
							</div>
						</label>
					</div>
				</div>
			)}

			{/* Navigation */}
			<div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
				<button
					type="button"
					onClick={handlePreviousStep}
					className={`px-6 py-3 rounded-xl font-medium transition-colors ${
						step === 1
							? "text-gray-400 cursor-not-allowed"
							: "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
					}`}
					disabled={step === 1}
				>
					← Anterior
				</button>

				<button
					type="button"
					onClick={handleNextStep}
					disabled={isRegistering}
					className={`px-6 py-3 rounded-xl font-semibold transition-all ${
						isRegistering
							? "bg-gray-400 text-white cursor-not-allowed"
							: "bg-gradient-to-r from-electric-500 to-cyan-500 text-white hover:from-electric-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
					}`}
				>
					{isRegistering ? (
						<span className="flex items-center gap-2">
							<svg
								className="animate-spin h-5 w-5 text-white"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							{step === 3 ? "Creando cuenta..." : "Procesando..."}
						</span>
					) : step === 3 ? (
						"Crear cuenta"
					) : (
						"Continuar →"
					)}
				</button>
			</div>

			{/* Footer Link */}
			<div className="mt-8 pt-8 border-t border-gray-100 text-center">
				<p className="text-gray-600">
					¿Ya tienes una cuenta?{" "}
					<Link
						href="/login"
						className="text-electric-500 hover:text-electric-600 font-medium"
					>
						Inicia sesión aquí
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
};

export default RegisterPage;
