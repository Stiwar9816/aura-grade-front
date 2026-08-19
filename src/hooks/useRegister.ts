"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
	DocumentType,
	Institution,
	RegisterFormData,
	UserRole,
} from "@/interface";
import {useAuth} from "./";
import {
	PASSWORD_MIN_LENGTH,
	passwordPolicyError,
} from "@/utils/passwordPolicy";

export const useRegister = () => {
	const router = useRouter();
	const {register: registerCore, isLoading, error: authError} = useAuth();
	const [serverError, setServerError] = useState<string | null>(null);
	const [step, setStep] = useState<number>(1);
	const [institutions, setInstitutions] = useState<Institution[]>([]);
	const [institutionsLoading, setInstitutionsLoading] = useState(true);
	const [formData, setFormData] = useState<RegisterFormData>({
		name: "",
		last_name: "",
		documentType: "" as DocumentType,
		documentNum: "",
		phone: "",
		email: "",
		password: "",
		confirmPassword: "",
		userType: UserRole.STUDENT,
		institutionId: "",
		acceptTerms: false,
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof RegisterFormData, string>>
	>({});
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const displayError: string | null = serverError || authError;

	useEffect(() => {
		let active = true;
		void fetch("/api/institutions", {cache: "no-store"})
			.then(async (response) => {
				const result = (await response.json()) as {
					error?: string;
					institutions?: Institution[];
				};
				if (!response.ok) {
					throw new Error(
						result.error || "No fue posible cargar las instituciones.",
					);
				}
				if (active) setInstitutions(result.institutions || []);
			})
			.catch((error: unknown) => {
				if (active) {
					setServerError(
						error instanceof Error
							? error.message
							: "No fue posible cargar las instituciones.",
					);
				}
			})
			.finally(() => {
				if (active) setInstitutionsLoading(false);
			});
		return () => {
			active = false;
		};
	}, []);

	const validateStep = (stepNumber: number): boolean => {
		const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

		if (stepNumber === 1) {
			if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
			if (!formData.last_name.trim())
				newErrors.last_name = "El apellido es requerido";
			if (!formData.documentType) {
				newErrors.documentType = "El tipo de documento es requerido";
			}
			if (!formData.documentNum.trim()) {
				newErrors.documentNum = "El número de documento es requerido";
			} else if (!/^\d+$/.test(formData.documentNum)) {
				newErrors.documentNum = "Solo se permiten números";
			}
			if (!formData.phone.trim()) {
				newErrors.phone = "El teléfono es requerido";
			} else if (!/^\d+$/.test(formData.phone)) {
				newErrors.phone = "Solo se permiten números";
			}
			if (!formData.email.trim()) {
				newErrors.email = "El correo electrónico es requerido";
			} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
				newErrors.email = "El correo electrónico no es válido";
			}
			if (!formData.userType)
				newErrors.userType = "Debes seleccionar un tipo de usuario";
			if (!formData.institutionId) {
				newErrors.institutionId = "Debes seleccionar tu institución";
			}
		}

		if (stepNumber === 2) {
			if (!formData.password) {
				newErrors.password = "La contraseña es requerida";
			} else {
				const policyError = passwordPolicyError(formData.password);
				if (policyError) newErrors.password = policyError;
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
		setServerError(null);

		const result = await registerCore({
			name: formData.name,
			last_name: formData.last_name,
			document_type: formData.documentType,
			document_num: parseInt(formData.documentNum, 10),
			phone: parseInt(formData.phone, 10),
			email: formData.email,
			password: formData.password,
			role: formData.userType,
			institutionId: formData.institutionId,
		});

		if (result.success && result.pendingApproval) {
			router.push("/registration-pending");
		} else if (result.success && result.user) {
			const role = result.user.role;
			const dest =
				role === UserRole.ADMIN || role === UserRole.TEACHER
					? "/teacher"
					: "/student";
			router.push(dest);
		} else if (result.error) {
			setServerError(result.error);
		}
	};

	const getPasswordStrength = (password: string) => {
		if (!password) return {score: 0, label: "", color: "bg-gray-200"};

		let score = 0;
		if (password.length >= 8) score++;
		if (password.length >= 12) score++;
		if (password.length >= PASSWORD_MIN_LENGTH) score++;
		if (password.length >= 20) score++;
		if (password.length >= 30) score++;

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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const {name, value, type} = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleTypeChange = (
		name: keyof RegisterFormData,
		value: RegisterFormData[keyof RegisterFormData],
	) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return {
		formData,
		institutions,
		institutionsLoading,
		setFormData,
		step,
		setStep,
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
	};
};
