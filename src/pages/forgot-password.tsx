import React, {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import useAuth from "@/hooks/useAuth";
import AuthLayout from "@/components/Auth/AuthLayout";

const ForgotPasswordPage: React.FC = () => {
	const router = useRouter();
	const {resetPassword, isLoading, error: authError} = useAuth();
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const {success} = await resetPassword(email);

		if (success) {
			setIsSubmitted(true);
			// Redirigir después de 5 segundos
			setTimeout(() => {
				router.push("/login");
			}, 5000);
		}
	};

	return (
		<AuthLayout
			title={isSubmitted ? "¡Correo enviado!" : "¿Olvidaste tu contraseña?"}
			subtitle={
				isSubmitted
					? "Revisa tu bandeja de entrada para continuar"
					: "Ingresa tu email y te enviaremos instrucciones"
			}
		>
			{!isSubmitted ? (
				<>
					{authError && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
							<div className="flex items-center gap-3">
								<span className="text-red-600">⚠️</span>
								<span className="text-red-700">{authError}</span>
							</div>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
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
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-electric-500 focus:ring-2 focus:ring-electric-200 outline-none transition-all"
									placeholder="tu@email.com"
									required
								/>
							</div>
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
									Enviando instrucciones...
								</span>
							) : (
								"Enviar instrucciones"
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<Link
							href="/login"
							className="text-electric-500 hover:text-electric-600 font-medium"
						>
							← Volver al inicio de sesión
						</Link>
					</div>
				</>
			) : (
				<div className="text-center">
					<div className="mb-6">
						<div className="text-5xl mb-4 text-green-500">✅</div>
						<p className="text-gray-600 mb-4">
							Hemos enviado instrucciones para restablecer tu contraseña a:
						</p>
						<div className="font-medium text-electric-500 bg-electric-50 p-3 rounded-xl">
							{email}
						</div>
					</div>

					<div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6 font-normal">
						<h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
							<span>📧</span>
							<span>¿Qué hacer ahora?</span>
						</h3>
						<ul className="space-y-3 text-sm text-gray-700 text-left">
							<li className="flex items-start gap-2">
								<span className="text-blue-500 mt-1">1.</span>
								<span>Revisa tu bandeja de entrada</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-blue-500 mt-1">2.</span>
								<span>Haz clic en el enlace que te enviamos</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-blue-500 mt-1">3.</span>
								<span>Crea una nueva contraseña</span>
							</li>
						</ul>
					</div>

					<div className="text-sm text-gray-600 mb-6">
						Serás redirigido en{" "}
						<span className="font-extrabold text-electric-500">5 segundos</span>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<button
							onClick={() => router.push("/login")}
							className="py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-colors"
						>
							Ir a Login
						</button>
						<button
							onClick={() => setIsSubmitted(false)}
							className="py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
						>
							Reenviar
						</button>
					</div>
				</div>
			)}
		</AuthLayout>
	);
};

export default ForgotPasswordPage;
