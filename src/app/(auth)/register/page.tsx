"use client";

import Link from "next/link";
import {DocumentType, UserRole} from "@/types";
import {AuthLayout} from "@/components/Auth";
import {useRegister} from "@/hooks";

const RegisterPage: React.FC = () => {
	const {
		formData,
		step,
		errors,
		showPassword,
		setShowPassword,
		isLoading,
		displayError,
		handleNextStep,
		handlePreviousStep,
		handleChange,
		handleTypeChange,
		getPasswordStrength,
	} = useRegister();

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

			{displayError && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
					<div className="flex items-center gap-3">
						<span className="text-red-600">⚠️</span>
						<span className="text-red-700">{displayError}</span>
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
								name="name"
								value={formData.name}
								onChange={handleChange}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.name
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="Ej: María"
							/>
							{errors.name && (
								<p className="mt-1 text-sm text-red-600">{errors.name}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Apellido *
							</label>
							<input
								type="text"
								name="last_name"
								value={formData.last_name}
								onChange={handleChange}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.last_name
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="Ej: González"
							/>
							{errors.last_name && (
								<p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Tipo de Documento *
							</label>
							<select
								name="documentType"
								value={formData.documentType}
								onChange={handleChange}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all bg-white ${
									errors.documentType
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
							>
								<option value="">Seleccionar...</option>
								<option value={DocumentType.CITIZENSHIP_CARD}>
									Cédula de Ciudadanía
								</option>
								<option value={DocumentType.PASSPORT}>Pasaporte</option>
								<option value={DocumentType.CIVIL_REGISRTRY}>
									Registro Civil
								</option>
								<option value={DocumentType.IDENTITY_CARD}>
									Tarjeta de Identidad
								</option>
								<option value={DocumentType.MILITARY_ID}>
									Libreta Militar
								</option>
								<option value={DocumentType.FOREIGNER_CARD}>
									Cédula de Extranjería
								</option>
							</select>
							{errors.documentType && (
								<p className="mt-1 text-sm text-red-600">
									{errors.documentType}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Documento de Identidad *
							</label>
							<input
								type="text"
								name="documentNum"
								value={formData.documentNum}
								onChange={handleChange}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.documentNum
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="Ej: 1234567890"
							/>
							{errors.documentNum && (
								<p className="mt-1 text-sm text-red-600">
									{errors.documentNum}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Teléfono *
							</label>
							<input
								type="tel"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.phone
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="Ej: 3001234567"
							/>
							{errors.phone && (
								<p className="mt-1 text-sm text-red-600">{errors.phone}</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Correo electrónico *
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-electric-200 outline-none transition-all ${
									errors.email
										? "border-red-500"
										: "border-gray-300 focus:border-electric-500"
								}`}
								placeholder="tu@email.com"
								required
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">{errors.email}</p>
							)}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-4">
							¿Cómo usarás AuraGrade? *
						</label>
						<div className="grid grid-cols-1 gap-4">
							<button
								type="button"
								onClick={() => handleTypeChange("userType", UserRole.STUDENT)}
								className={`p-4 border-2 rounded-xl text-left transition-all ${
									formData.userType === UserRole.STUDENT
										? "border-electric-500 bg-electric-50"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${
											formData.userType === UserRole.STUDENT
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
								onClick={() => handleTypeChange("userType", UserRole.TEACHER)}
								className={`p-4 border-2 rounded-xl text-left transition-all ${
									formData.userType === UserRole.TEACHER
										? "border-electric-500 bg-electric-50"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${
											formData.userType === UserRole.TEACHER
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
								name="password"
								value={formData.password}
								onChange={handleChange}
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
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
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
										{formData.name} {formData.last_name}
									</div>
								</div>
								<div>
									<div className="text-sm text-gray-600">Tipo de usuario</div>
									<div className="font-medium text-gray-900">
										{formData.userType === UserRole.STUDENT
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
								name="acceptTerms"
								checked={formData.acceptTerms}
								onChange={handleChange}
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
					disabled={isLoading}
					className={`px-6 py-3 rounded-xl font-semibold transition-all ${
						isLoading
							? "bg-gray-400 text-white cursor-not-allowed"
							: "bg-gradient-to-r from-electric-500 to-cyan-500 text-white hover:from-electric-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
					}`}
				>
					{isLoading ? (
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
