import {useMemo, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faArrowRotateLeft,
	faCheck,
	faCloudArrowUp,
	faDownload,
	faFileExcel,
	faShieldHalved,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import {ProtectedRoute} from "@/components/Auth";
import {useAuth} from "@/hooks";
import {UserRole} from "@/interface";
import {notifyError, notifyLoading, notifySuccess} from "@/utils/toastNotify";

const INSTITUTION_TEMPLATE_URL =
	"/templates/plantilla-importacion-usuarios-aura-grade.xlsx";
const PLATFORM_TEMPLATE_URL =
	"/templates/plantilla-importacion-administradores-aura-grade.xlsx";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type ImportRowResult = {
	row: number;
	email?: string | null;
	imported: boolean;
	message: string;
};

type ImportResult = {
	total: number;
	imported: number;
	rejected: number;
	rows: ImportRowResult[];
};

const importUsers = async (
	file: File,
	isPlatformAdmin: boolean,
): Promise<ImportResult> => {
	const mutationName = isPlatformAdmin
		? "importPlatformAdministrators"
		: "importInstitutionUsers";
	const formData = new FormData();
	formData.append(
		"operations",
		JSON.stringify({
			query: `
				mutation ImportUsers($file: Upload!) {
					${mutationName}(file: $file) {
						total
						imported
						rejected
						rows {
							row
							email
							imported
							message
						}
					}
				}
			`,
			variables: {file: null},
		}),
	);
	formData.append("map", JSON.stringify({"0": ["variables.file"]}));
	formData.append("0", file);

	const response = await fetch("/api/graphql", {
		method: "POST",
		credentials: "same-origin",
		body: formData,
	});
	const payload = (await response.json().catch(() => null)) as
		| {
				data?: Record<string, ImportResult | undefined>;
				errors?: {message?: string}[];
				message?: string | string[];
				error?: string;
		  }
		| null;

	let errorMessage: string | undefined;
	if (payload?.errors?.length) {
		errorMessage = payload.errors.map((e) => e.message).filter(Boolean).join(" | ");
	} else if (payload?.message) {
		errorMessage = Array.isArray(payload.message)
			? payload.message.join(", ")
			: payload.message;
	} else if (payload?.error) {
		errorMessage = payload.error;
	} else if (!response.ok) {
		errorMessage = `Error en el servidor (${response.status}: ${response.statusText})`;
	}

	if (!response.ok || errorMessage) {
		throw new Error(
			errorMessage ||
				"No fue posible procesar el archivo de usuarios.",
		);
	}
	const result = payload?.data?.[mutationName];
	if (!result) {
		throw new Error("El backend no devolvió el resultado de la importación.");
	}
	return result;
};

const ImportUsersPage = () => {
	const {user} = useAuth();
	const inputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [dragging, setDragging] = useState(false);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<ImportResult | null>(null);

	const isPlatformAdmin = Boolean(user?.isPlatformAdmin);
	const subject = isPlatformAdmin ? "administradores" : "usuarios";
	const templateUrl = isPlatformAdmin
		? PLATFORM_TEMPLATE_URL
		: INSTITUTION_TEMPLATE_URL;
	const fileSize = useMemo(
		() => (file ? `${(file.size / 1024).toFixed(1)} KB` : ""),
		[file],
	);

	const selectFile = (candidate?: File) => {
		if (!candidate) return;
		if (!candidate.name.toLowerCase().endsWith(".xlsx")) {
			notifyError("Selecciona un archivo con extensión .xlsx.");
			return;
		}
		if (candidate.size > MAX_FILE_SIZE) {
			notifyError("El archivo supera el límite de 5 MB.");
			return;
		}
		setFile(candidate);
		setResult(null);
	};

	const reset = () => {
		setFile(null);
		setResult(null);
		if (inputRef.current) inputRef.current.value = "";
	};

	const submit = async () => {
		if (!file || loading) return;
		setLoading(true);
		const notificationId = notifyLoading(
			`Validando e importando ${subject}...`,
		);
		try {
			const importResult = await importUsers(file, isPlatformAdmin);
			setResult(importResult);
			if (importResult.imported > 0 && importResult.rejected === 0) {
				notifySuccess(
					`${importResult.imported} ${subject} fueron creados e invitados correctamente.`,
					{id: notificationId},
				);
			} else if (importResult.imported > 0) {
				notifySuccess(
					`Proceso terminado: ${importResult.imported} creados y ${importResult.rejected} rechazados.`,
					{id: notificationId},
				);
			} else {
				const rejectionDetails = [
					...new Set(
						importResult.rows
							.filter((row) => !row.imported && row.message)
							.map((row) => row.message),
					),
				]
					.slice(0, 2)
					.join(" | ");
				const singularSubject = isPlatformAdmin
					? "administrador"
					: "usuario";
				notifyError(
					rejectionDetails
						? `No se pudo importar ningún ${singularSubject}: ${rejectionDetails}`
						: `No se pudo importar ningún ${singularSubject} (${importResult.rejected} rechazados). Revisa el detalle en pantalla.`,
					{id: notificationId},
				);
			}
		} catch (error) {
			notifyError(
				error instanceof Error
					? error.message
					: `No fue posible importar los ${subject}.`,
				{id: notificationId},
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ProtectedRoute requiredRole={UserRole.ADMIN}>
			<Layout
				title={
					isPlatformAdmin
						? "Importación global de administradores"
						: "Importación institucional de usuarios"
				}
			>
					<div className="space-y-6">
						<div className="grid gap-4 lg:grid-cols-3">
							<Card className="border-slate-200 bg-slate-800 text-white">
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
											Paso 1
										</p>
										<h2 className="mt-2 text-lg font-semibold">
											{isPlatformAdmin
												? "Descarga la plantilla global"
												: "Descarga la plantilla oficial"}
										</h2>
										<p className="mt-2 text-sm text-slate-300">
											Incluye listas válidas, guía y formato institucional.
										</p>
									</div>
									<FontAwesomeIcon icon={faFileExcel} className="text-3xl text-cyan-300" />
								</div>
								<a
									href={templateUrl}
									download
									className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-cyan-50"
								>
									<FontAwesomeIcon icon={faDownload} className="mr-2" />
									Descargar Plantilla
								</a>
							</Card>

							<Card>
								<p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
									Paso 2
								</p>
								<h2 className="mt-2 text-lg font-semibold text-gray-900">
									{isPlatformAdmin
										? "Completa los administradores"
										: "Completa docentes y estudiantes"}
								</h2>
								<p className="mt-2 text-sm text-gray-600">
									{isPlatformAdmin
										? "Usa el NIT de una institución existente. No agregues contraseñas."
										: "Conserva los encabezados. No agregues cursos ni contraseñas."}
								</p>
								<div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
									<FontAwesomeIcon icon={faShieldHalved} />
									La contraseña la crea cada usuario
								</div>
							</Card>

							<Card>
								<p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
									Paso 3
								</p>
								<h2 className="mt-2 text-lg font-semibold text-gray-900">
									Carga y revisa el resultado
								</h2>
								<p className="mt-2 text-sm text-gray-600">
									Las filas incorrectas no detienen las que sí son válidas.
								</p>
								<p className="mt-4 text-sm font-medium text-gray-800">
									Hasta 500 {subject} · máximo 5 MB
								</p>
							</Card>
						</div>

						<Card>
							<div
								className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
									dragging
										? "border-electric-500 bg-electric-50"
										: "border-gray-300 bg-gray-50 hover:border-electric-300"
								}`}
								onDragEnter={(event) => {
									event.preventDefault();
									setDragging(true);
								}}
								onDragOver={(event) => event.preventDefault()}
								onDragLeave={() => setDragging(false)}
								onDrop={(event) => {
									event.preventDefault();
									setDragging(false);
									selectFile(event.dataTransfer.files[0]);
								}}
							>
								<FontAwesomeIcon
									icon={file ? faFileExcel : faCloudArrowUp}
									className="text-4xl text-emerald-500"
								/>
								{file ? (
									<>
										<h2 className="mt-3 font-semibold text-gray-900">{file.name}</h2>
										<p className="mt-1 text-sm text-gray-500">{fileSize}</p>
									</>
								) : (
									<>
										<h2 className="mt-3 text-lg font-semibold text-gray-900">
											Arrastra aquí la plantilla diligenciada
										</h2>
										<p className="mt-1 text-sm text-gray-500">Solo archivos .xlsx</p>
									</>
								)}
								<input
									ref={inputRef}
									type="file"
									accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
									className="hidden"
									onChange={(event) => selectFile(event.target.files?.[0])}
								/>
								<button
									type="button"
									onClick={() => inputRef.current?.click()}
									className="mt-4 rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-100"
								>
									{file ? "Cambiar archivo" : "Seleccionar archivo"}
								</button>
							</div>
							<div className="mt-4 flex flex-wrap justify-end gap-3">
								{(file || result) && (
									<button
										type="button"
										onClick={reset}
										disabled={loading}
										className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 disabled:opacity-50"
									>
										<FontAwesomeIcon icon={faArrowRotateLeft} className="mr-2" />
										Limpiar
									</button>
								)}
								<button
									type="button"
									onClick={() => void submit()}
									disabled={!file || loading}
									className="rounded-xl bg-electric-500 px-5 py-2 font-semibold text-white transition hover:bg-electric-600 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<FontAwesomeIcon icon={faCloudArrowUp} className="mr-2" />
									{loading
										? "Procesando..."
										: `Importar ${subject}`}
								</button>
							</div>
						</Card>

						{result && (
							<Card>
								<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
									<div>
										<p className="text-sm font-medium text-gray-500">Resultado del archivo</p>
										<h2 className="mt-1 text-xl font-semibold text-gray-900">
											{result.total} filas procesadas
										</h2>
									</div>
									<div className="flex gap-3">
										<span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">
											{result.imported} creados
										</span>
										<span className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-800">
											{result.rejected} rechazados
										</span>
									</div>
								</div>
								<div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
									<table className="min-w-full divide-y divide-gray-200 text-sm">
										<thead className="bg-slate-50 text-left text-gray-600">
											<tr>
												<th className="px-4 py-3 font-semibold">Fila</th>
												<th className="px-4 py-3 font-semibold">Correo</th>
												<th className="px-4 py-3 font-semibold">Estado</th>
												<th className="px-4 py-3 font-semibold">Detalle</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 bg-white">
											{(result.rows || []).map((row) => (
												<tr key={`${row.row}-${row.email || "sin-correo"}`}>
													<td className="px-4 py-3 font-medium text-gray-900">{row.row}</td>
													<td className="px-4 py-3 text-gray-600">{row.email || "—"}</td>
													<td className="px-4 py-3">
														<span className={row.imported ? "text-emerald-700" : "text-red-700"}>
															<FontAwesomeIcon icon={row.imported ? faCheck : faXmark} className="mr-2" />
															{row.imported ? "Creado" : "Rechazado"}
														</span>
													</td>
													<td className="px-4 py-3 text-gray-600">{row.message}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Card>
						)}
					</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default ImportUsersPage;
