"use client";

import React, {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {UserRole} from "@/types";
import AuthLayout from "@/components/Auth/AuthLayout";
import useAuth from "@/hooks/useAuth";

const LoginPage: React.FC = () => {
	const router = useRouter();
	const {login, isLoading, error} = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await login(formData);
		if (result.success && result.user) {
			const role = result.user.role;
			const dest =
				role === UserRole.ADMIN || role === UserRole.TEACHER
					? "/teacher"
					: "/student";
			router.push(dest);
		}
	};

	const handleSocialLogin = (provider: string) => {
		console.log(`Login with ${provider}`);
	};

	const features = [
		{
			icon: "🤖",
			title: "IA Especializada",
			description:
				"Modelos entrenados específicamente para evaluación educativa",
			gradient: "from-electric-500 to-cyan-500",
		},
		{
			icon: "⚡",
			title: "Feedback Instantáneo",
			description: "Resultados detallados en menos de 30 segundos",
			gradient: "from-purple-500 to-pink-500",
		},
		{
			icon: "📊",
			title: "Análisis Profundo",
			description: "Insights pedagógicos para mejorar el aprendizaje",
			gradient: "from-green-500 to-emerald-500",
		},
	];

	return (
		<AuthLayout
			title="Bienvenido de nuevo"
			subtitle="Ingresa a tu cuenta para continuar"
			features={features}
		>
			{/* Social Login */}
			<div className="mb-8">
				<div className="grid grid-cols-2 gap-4">
					<button
						onClick={() => handleSocialLogin("google")}
						className="flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-xl hover:border-electric-500 hover:bg-electric-50 transition-colors"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						<span className="font-medium text-gray-700">Google</span>
					</button>

					<button
						onClick={() => handleSocialLogin("microsoft")}
						className="flex items-center justify-center gap-3 p-3 border border-gray-300 rounded-xl hover:border-electric-500 hover:bg-electric-50 transition-colors"
					>
						<svg className="w-5 h-5" viewBox="0 0 23 23">
							<path fill="#f35325" d="M1 1h10v10H1z" />
							<path fill="#81bc06" d="M12 1h10v10H12z" />
							<path fill="#05a6f0" d="M1 12h10v10H1z" />
							<path fill="#ffba08" d="M12 12h10v10H12z" />
						</svg>
						<span className="font-medium text-gray-700">Microsoft</span>
					</button>
				</div>

				<div className="flex items-center my-6">
					<div className="flex-1 h-px bg-gray-300"></div>
					<span className="px-4 text-sm text-gray-500">
						o ingresa con email
					</span>
					<div className="flex-1 h-px bg-gray-300"></div>
				</div>
			</div>

			{/* Login Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="p-4 bg-red-50 border border-red-200 rounded-xl">
						<div className="flex items-center gap-3">
							<span className="text-red-600">⚠️</span>
							<span className="text-red-700">{error}</span>
						</div>
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Correo electrónico
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
									d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<input
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({...formData, email: e.target.value})
							}
							className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-electric-500 focus:ring-2 focus:ring-electric-200 outline-none transition-all"
							placeholder="tu@email.com"
							required
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Contraseña
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<input
							type={showPassword ? "text" : "password"}
							value={formData.password}
							onChange={(e) =>
								setFormData({...formData, password: e.target.value})
							}
							className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-electric-500 focus:ring-2 focus:ring-electric-200 outline-none transition-all"
							placeholder="••••••••"
							required
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
				</div>

				<div className="flex items-center justify-between">
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={formData.rememberMe}
							onChange={(e) =>
								setFormData({...formData, rememberMe: e.target.checked})
							}
							className="h-4 w-4 text-electric-500 rounded border-gray-300 focus:ring-electric-200"
						/>
						<span className="ml-2 text-sm text-gray-700">Recordarme</span>
					</label>

					<Link
						href="/forgot-password"
						className="text-sm text-electric-500 hover:text-electric-600 font-medium"
					>
						¿Olvidaste tu contraseña?
					</Link>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all ${
						isLoading
							? "bg-gray-400 cursor-not-allowed"
							: "bg-gradient-to-r from-electric-500 to-cyan-500 hover:from-electric-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
					}`}
				>
					{isLoading ? (
						<span className="flex items-center justify-center gap-2">
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
							Iniciando sesión...
						</span>
					) : (
						"Iniciar sesión"
					)}
				</button>
			</form>

			{/* Register Link */}
			<div className="mt-8 pt-8 border-t border-gray-200 text-center">
				<p className="text-gray-600">
					¿No tienes una cuenta?{" "}
					<Link
						href="/register"
						className="text-electric-500 hover:text-electric-600 font-medium"
					>
						Regístrate aquí
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
};

export default LoginPage;
