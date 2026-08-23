import {FormEvent, useEffect, useState} from "react";
import {useRouter} from "next/router";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faCheckCircle,
	faEye,
	faEyeSlash,
	faKey,
} from "@fortawesome/free-solid-svg-icons";
import {passwordPolicyError} from "@/utils/passwordPolicy";

const CreatePasswordPage = () => {
	const router = useRouter();
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [complete, setComplete] = useState(false);

	useEffect(() => {
		if (!router.isReady || typeof router.query.token !== "string") return;
		setToken(router.query.token);
		void router.replace("/create-password", undefined, {shallow: true});
	}, [router]);

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null);
		if (!token) {
			setError("El enlace de invitación está incompleto.");
			return;
		}
		const policyError = passwordPolicyError(password);
		if (policyError) {
			setError(policyError);
			return;
		}
		if (password !== confirmation) {
			setError("Las contraseñas no coinciden.");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/user-invitations/accept", {
				method: "POST",
				headers: {"content-type": "application/json"},
				body: JSON.stringify({token, password}),
			});
			const payload = (await response.json().catch(() => null)) as
				| {error?: string; message?: string}
				| null;
			if (!response.ok) {
				throw new Error(
					payload?.message || payload?.error || "No fue posible crear la contraseña.",
				);
			}
			setComplete(true);
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "No fue posible crear la contraseña.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-5">
			<section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
				<Image
					src="/logo.png"
					alt="Aura Grade"
					width={220}
					height={88}
					priority
					className="mx-auto h-auto w-44"
				/>
				{complete ? (
					<div className="mt-8 text-center">
						<FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-emerald-500" />
						<h1 className="mt-4 text-2xl font-bold text-gray-900">Cuenta activada</h1>
						<p className="mt-2 text-gray-600">
							Tu contraseña fue creada. Ya puedes iniciar sesión y configurar tu OTP.
						</p>
						<button
							type="button"
							onClick={() => void router.push("/login")}
							className="mt-6 w-full rounded-xl bg-electric-500 px-4 py-3 font-semibold text-white hover:bg-electric-600"
						>
							Ir al inicio de sesión
						</button>
					</div>
				) : (
					<>
						<div className="mt-7 text-center">
							<FontAwesomeIcon icon={faKey} className="text-3xl text-electric-500" />
							<h1 className="mt-3 text-2xl font-bold text-gray-900">Crea tu contraseña</h1>
							<p className="mt-2 text-sm text-gray-600">
								Este enlace es personal, vence en 72 horas y solo funciona una vez.
							</p>
						</div>
						<form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4">
							<label className="block text-sm font-semibold text-gray-800">
								Nueva contraseña
								<div className="relative mt-2">
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										autoComplete="new-password"
										required
										className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-electric-500 focus:ring-2 focus:ring-electric-100"
									/>
									<button
										type="button"
										onClick={() => setShowPassword((current) => !current)}
										aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
									>
										<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
									</button>
								</div>
							</label>
							<label className="block text-sm font-semibold text-gray-800">
								Confirma la contraseña
								<input
									type={showPassword ? "text" : "password"}
									value={confirmation}
									onChange={(event) => setConfirmation(event.target.value)}
									autoComplete="new-password"
									required
									className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-electric-500 focus:ring-2 focus:ring-electric-100"
								/>
							</label>
							<p className="text-xs leading-5 text-gray-500">
								Usa entre 15 y 128 caracteres, sin espacios, y evita contraseñas comunes.
							</p>
							{error && (
								<p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
									{error}
								</p>
							)}
							<button
								type="submit"
								disabled={loading}
								className="w-full rounded-xl bg-electric-500 px-4 py-3 font-semibold text-white hover:bg-electric-600 disabled:opacity-50"
							>
								{loading ? "Guardando..." : "Crear contraseña"}
							</button>
						</form>
					</>
				)}
			</section>
		</main>
	);
};

export default CreatePasswordPage;
