import {
	faCloudUpload,
	faFileText,
	faFolderOpen,
	faPaperclip,
	faRocket,
	faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useCallback, useState, useRef} from "react";

interface UploadZoneProps {
	onUploadStart: (file: File) => void;
	disabled?: boolean;
	assignmentTitle?: string;
}

interface FileValidation {
	isValid: boolean;
	error?: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({
	onUploadStart,
	disabled = false,
	assignmentTitle,
}) => {
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string>("");
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const validateFile = (file: File): FileValidation => {
		// Validar tamaño (15MB máximo)
		const maxSize = 15 * 1024 * 1024; // 15MB en bytes
		if (file.size > maxSize) {
			return {
				isValid: false,
				error: "El archivo es demasiado grande (máximo 15MB)",
			};
		}

		// Validar tipo por extensión
		const validExtensions = [".docx"];
		const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

		if (!validExtensions.includes(fileExtension)) {
			return {
				isValid: false,
				error: "Formato no soportado. Usa un archivo DOCX",
			};
		}

		// Validar tipo MIME
		const validMimeTypes = [
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/octet-stream",
			"application/zip",
			"application/x-zip-compressed",
		];

		if (!validMimeTypes.includes(file.type) && file.type !== "") {
			return {
				isValid: false,
				error: "Tipo de archivo no válido",
			};
		}

		return {isValid: true};
	};

	const handleFileSelect = useCallback((selectedFile: File) => {
		const validation = validateFile(selectedFile);

		if (!validation.isValid) {
			setError(validation.error || "Error desconocido");
			setFile(null);
			return;
		}

		setFile(selectedFile);
		setError("");
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);

			if (disabled) return;

			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				handleFileSelect(e.dataTransfer.files[0]);
			}
		},
		[disabled, handleFileSelect],
	);

	const onDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			if (disabled) return;
			setIsDragging(true);
		},
		[disabled],
	);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			handleFileSelect(e.target.files[0]);
		}
	};

	const handleUpload = () => {
		if (file && !disabled) {
			onUploadStart(file);
		}
	};

	const triggerFileInput = () => {
		if (!disabled && fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const getFileIcon = (fileName: string) => {
		const extension = fileName.split(".").pop()?.toLowerCase();
		switch (extension) {
			case "docx":
				return <FontAwesomeIcon icon={faFileText} />;
			default:
				return <FontAwesomeIcon icon={faPaperclip} />;
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const zoneIcon = isDragging ? (
		<FontAwesomeIcon icon={faFolderOpen} />
	) : error ? (
		<FontAwesomeIcon icon={faTriangleExclamation} />
	) : file ? (
		<FontAwesomeIcon icon={faFileText} />
	) : (
		<FontAwesomeIcon icon={faCloudUpload} />
	);
	const zoneTitle = isDragging
		? "¡Suelta tu archivo aquí!"
		: disabled
			? "Selecciona una tarea primero"
			: file
				? "Archivo listo"
				: "Arrastra y suelta tu trabajo";
	const zoneSubtitle = file
		? `"${file.name}" seleccionado`
		: disabled
			? "El centro de entregas necesita saber a qué tarea corresponde el archivo"
			: "o haz clic para seleccionar archivos";

	return (
		<div className="card p-8">
			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Sube tu trabajo
				</h2>
				<p className="text-gray-600">
					{assignmentTitle
						? `Entrega para: ${assignmentTitle}`
						: "Selecciona una tarea para comenzar la entrega"}
				</p>
			</div>

			{/* Drop Zone */}
			<div
				onDrop={onDrop}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onClick={!file ? triggerFileInput : undefined}
				className={`relative border-2 rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 overflow-hidden ${
					disabled
						? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
						: isDragging
							? "border-electric-500 bg-electric-50/50 backdrop-blur-md shadow-2xl shadow-electric-500/20 scale-[1.01]"
							: error
								? "border-red-500 bg-red-50/50 backdrop-blur-md"
								: file
									? "border-green-500 bg-green-900/50 backdrop-blur-md shadow-lg shadow-green-500/10"
									: "border-gray-200 bg-white/40 backdrop-blur-sm hover:border-electric-400 hover:bg-white/60 hover:shadow-xl hover:shadow-electric-500/5 group"
				}`}
			>
				{/* Background Aura Glow (Only visible on hover/drag) */}
				<div className="absolute -top-24 -left-24 w-48 h-48 bg-electric-500/10 rounded-full blur-3xl group-hover:bg-electric-500/20 transition-colors duration-500 -z-10"></div>
				<div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-500 -z-10"></div>
				<input
					ref={fileInputRef}
					type="file"
					onChange={handleFileInputChange}
					accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					className="hidden"
				/>

				<div className="space-y-4">
					<div className="text-6xl mb-4">{zoneIcon}</div>

					<div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							{zoneTitle}
						</h3>
						<p className="text-gray-600">{zoneSubtitle}</p>
					</div>

					<div className="inline-flex flex-wrap items-center gap-3 px-5 py-1.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm text-gray-600">
						<span className="flex items-center gap-1.5">
							<span className="text-blue-500">
								<FontAwesomeIcon icon={faFileText} />
							</span>{" "}
							.DOCX
						</span>
						<span className="w-1 h-1 bg-gray-300 rounded-full"></span>
						<span className="flex items-center gap-1.5">
							<span className="text-gray-500 text-xs font-bold bg-gray-100 px-1.5 rounded">
								MAX 15MB
							</span>
						</span>
					</div>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-red-100 rounded-lg">
							<span className="text-red-600 text-xl">
								<FontAwesomeIcon icon={faTriangleExclamation} />
							</span>
						</div>
						<div>
							<h4 className="font-medium text-gray-900">Error de validación</h4>
							<p className="text-red-700 mt-1">{error}</p>
						</div>
					</div>
				</div>
			)}

			{/* File Info */}
			{file && (
				<div className="mt-6">
					<div className="bg-white border-2 border-green-200 rounded-xl p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-green-100 rounded-xl">
									<span className="text-2xl">{getFileIcon(file.name)}</span>
								</div>
								<div>
									<h4 className="font-bold text-gray-900 text-lg">
										{file.name}
									</h4>
									<div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
										<span>{formatFileSize(file.size)}</span>
										<span>•</span>
										<span>{file.type || "Desconocido"}</span>
										<span>•</span>
										<span className="text-green-600 font-medium">Válido</span>
									</div>
								</div>
							</div>
							<button
								onClick={() => {
									setFile(null);
									setError("");
								}}
								className="p-2 text-gray-400 hover:text-gray-600"
							>
								✕
							</button>
						</div>

						{/* File Details */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							<div className="text-center p-3 bg-gray-100 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">Tipo</div>
								<div className="font-medium text-gray-900">
									{file.name.split(".").pop()?.toUpperCase()}
								</div>
							</div>
							<div className="text-center p-3 bg-gray-100 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">Tamaño</div>
								<div className="font-medium text-gray-900">
									{formatFileSize(file.size)}
								</div>
							</div>
							<div className="text-center p-3 bg-gray-100 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">
									Última modificación
								</div>
								<div className="font-medium text-gray-900">
									{new Date(file.lastModified).toLocaleDateString()}
								</div>
							</div>
							<div className="text-center p-3 bg-gray-100 rounded-lg">
								<div className="text-sm text-gray-600 mb-1">Estado</div>
								<div className="font-medium text-green-600">
									Listo para subir
								</div>
							</div>
						</div>

						{/* Upload Button */}
						<button
							onClick={handleUpload}
							disabled={disabled}
							className={`w-full btn-primary py-4 text-lg ${
								disabled ? "opacity-50 cursor-not-allowed" : ""
							}`}
						>
							<span className="flex items-center justify-center gap-3">
								<span>
									<FontAwesomeIcon icon={faRocket} />
								</span>
								<span>Iniciar Evaluación con IA</span>
							</span>
						</button>

						<p className="text-center text-gray-600 text-sm mt-4">
							La evaluación tomará aproximadamente 30 segundos
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default UploadZone;
