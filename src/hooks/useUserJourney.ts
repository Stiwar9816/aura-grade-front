import {useState, useEffect} from "react";

interface UserJourneyStep {
	id: string;
	title: string;
	description: string;
	status: "pending" | "active" | "completed" | "error";
	estimatedTime?: number; // in seconds
	actions?: {
		label: string;
		onClick: () => void;
		type: "primary" | "secondary" | "danger";
	}[];
}

interface UseUserJourneyProps {
	role: "student" | "teacher";
	journeyType: "upload" | "evaluation" | "creation" | "review";
	onComplete?: () => void;
	onError?: (error: string) => void;
}

export const useUserJourney = ({
	role,
	journeyType,
	onComplete,
	onError,
}: UseUserJourneyProps) => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [steps, setSteps] = useState<UserJourneyStep[]>([]);
	const [isComplete, setIsComplete] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Define journeys based on role and type
	const getJourneySteps = (): UserJourneyStep[] => {
		if (role === "student") {
			switch (journeyType) {
				case "upload":
					return [
						{
							id: "discovery",
							title: "Descubrimiento",
							description:
								"Revisando los criterios de evaluación antes de comenzar",
							status: "pending",
							estimatedTime: 5,
						},
						{
							id: "preparation",
							title: "Preparación",
							description: "Preparando tu archivo para la entrega",
							status: "pending",
							estimatedTime: 10,
						},
						{
							id: "action",
							title: "Acción",
							description: "Subiendo tu trabajo de forma segura",
							status: "pending",
							estimatedTime: 15,
						},
						{
							id: "active_wait",
							title: "Espera Activa",
							description: "Nuestra IA está leyendo y evaluando tu contenido",
							status: "pending",
							estimatedTime: 30,
						},
						{
							id: "closure",
							title: "Cierre",
							description: "¡Tu evaluación está lista!",
							status: "pending",
							estimatedTime: 2,
						},
					];
				case "evaluation":
					return [
						{
							id: "review",
							title: "Revisión",
							description: "Analizando los comentarios de la IA",
							status: "pending",
						},
						{
							id: "reflection",
							title: "Reflexión",
							description: "Identificando áreas de mejora",
							status: "pending",
						},
						{
							id: "action_plan",
							title: "Plan de Acción",
							description: "Creando tu plan de mejora",
							status: "pending",
						},
					];
			}
		} else {
			// teacher
			switch (journeyType) {
				case "creation":
					return [
						{
							id: "planning",
							title: "Planificación",
							description: "Definiendo objetivos y criterios de evaluación",
							status: "pending",
						},
						{
							id: "rubric_building",
							title: "Construcción de Rúbrica",
							description: "Configurando los criterios de evaluación",
							status: "pending",
						},
						{
							id: "publishing",
							title: "Publicación",
							description: "Compartiendo la tarea con estudiantes",
							status: "pending",
						},
					];
				case "review":
					return [
						{
							id: "monitoring",
							title: "Monitoreo",
							description: "Revisando entregas y progreso general",
							status: "pending",
						},
						{
							id: "validation",
							title: "Validación",
							description: "Comparando evaluación IA vs tu criterio",
							status: "pending",
						},
						{
							id: "analysis",
							title: "Análisis",
							description: "Extrayendo insights para decisiones pedagógicas",
							status: "pending",
						},
					];
			}
		}
		return [];
	};

	// Initialize steps
	useEffect(() => {
		const journeySteps = getJourneySteps();
		setSteps(journeySteps);
		if (journeySteps.length > 0) {
			setCurrentStep(0);
			updateStepStatus(0, "active");
		}
	}, [role, journeyType]);

	const updateStepStatus = (
		stepIndex: number,
		status: UserJourneyStep["status"],
	) => {
		setSteps((prev) =>
			prev.map((step, idx) => (idx === stepIndex ? {...step, status} : step)),
		);
	};

	const nextStep = () => {
		if (currentStep < steps.length - 1) {
			updateStepStatus(currentStep, "completed");
			updateStepStatus(currentStep + 1, "active");
			setCurrentStep(currentStep + 1);
		} else {
			updateStepStatus(currentStep, "completed");
			setIsComplete(true);
			onComplete?.();
		}
	};

	const previousStep = () => {
		if (currentStep > 0) {
			updateStepStatus(currentStep, "pending");
			updateStepStatus(currentStep - 1, "active");
			setCurrentStep(currentStep - 1);
		}
	};

	const setErrorStep = (stepIndex: number, errorMessage: string) => {
		updateStepStatus(stepIndex, "error");
		setError(errorMessage);
		onError?.(errorMessage);
	};

	const resetJourney = () => {
		const journeySteps = getJourneySteps();
		setSteps(journeySteps);
		setCurrentStep(0);
		setIsComplete(false);
		setError(null);
		if (journeySteps.length > 0) {
			updateStepStatus(0, "active");
		}
	};

	const getEstimatedTotalTime = () => {
		return steps.reduce((total, step) => total + (step.estimatedTime || 0), 0);
	};

	const getProgressPercentage = () => {
		if (steps.length === 0) return 0;
		return ((currentStep + 1) / steps.length) * 100;
	};

	const getFriendlyTimeEstimate = () => {
		const totalSeconds = getEstimatedTotalTime();
		if (totalSeconds < 60) {
			return `${totalSeconds} segundos`;
		} else if (totalSeconds < 3600) {
			return `${Math.round(totalSeconds / 60)} minutos`;
		} else {
			return `${Math.round(totalSeconds / 3600)} horas`;
		}
	};

	const getMicroCopyForStep = () => {
		const current = steps[currentStep];
		if (!current) return "";

		if (role === "student") {
			switch (current.id) {
				case "discovery":
					return "Sabemos que quieres entender exactamente cómo serás evaluado. Por eso mostramos claramente los criterios antes de que subas tu trabajo.";
				case "active_wait":
					return "Nuestra IA está leyendo tus argumentos con atención. Relájate, esto tomará solo unos segundos...";
				case "closure":
					return "¡Excelente trabajo! Tu evaluación está lista. Prepárate para insights valiosos que te ayudarán a mejorar.";
			}
		} else {
			switch (current.id) {
				case "monitoring":
					return "Mira quién ha entregado y quién necesita un recordatorio amigable.";
				case "validation":
					return "Compara la evaluación de IA con tu criterio experto. Tú siempre tienes la última palabra.";
				case "analysis":
					return "Convierte datos en decisiones pedagógicas más efectivas.";
			}
		}

		return "";
	};

	return {
		steps,
		currentStep,
		currentStepData: steps[currentStep],
		isComplete,
		error,
		nextStep,
		previousStep,
		setErrorStep,
		resetJourney,
		getProgressPercentage,
		getEstimatedTotalTime,
		getFriendlyTimeEstimate,
		getMicroCopyForStep,
	};
};
