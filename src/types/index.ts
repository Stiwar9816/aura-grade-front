export interface User {
	id: string;
	name: string;
	last_name: string;
	email: string;
	role: UserRole;
	token?: string;
	phone: number;
}

export interface DashboardStats {
	totalStudents: number;
	activeAssignments: number;
	pendingEvaluations: number;
	averageGrade: number;
	completionRate: number;
}

export interface UsersStats {
	users: {
		id: string;
		name: string;
		last_name: string;
		role: string;
		isActive: boolean;
		submissions: {
			id: string;
			status: string;
			evaluation: {
				id: string;
				status: string;
				totalScore: number;
			};
		}[];
		assignments: {
			id: string;
			title: string;
			isActive: boolean;
		}[];
		courses: {
			id: string;
			course_name: string;
		}[];
	}[];
}

export interface CoursesData {
	courses: {
		id: string;
		course_name: string;
		code_course: string;
		users?: {id: string}[];
	}[];
}

export interface Task {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	status: "pending" | "submitted" | "graded" | "overdue";
	score?: number;
	maxScore: number;
	studentCount?: number;
}
// CRITERIA REMOVED (Duplicate)
// EVALUATION
export interface Evaluation {
	id: string;
	taskId: string;
	studentId: string;
	overallScore: number;
	generalFeedback: string;
	criteriaFeedback: CriteriaFeedback[];
	createdAt: string;
}

export interface CriteriaFeedback {
	criteriaId: string;
	score: number;
	feedback: string;
	suggestion: string;
}
// ACTIVITY
export interface Activity {
	id: string;
	type: "upload" | "graded" | "ai_processing" | "rubric_updated" | "alert";
	user: string;
	time: string;
	task?: string;
	score?: number;
	message?: string;
}

export interface KPI {
	title: string;
	value: string | number;
	change: string;
	icon: string;
	color: "blue" | "green" | "purple" | "orange" | "cyan";
}

export interface UploadStep {
	id: number;
	title: string;
	description: string;
	icon?: string;
	status?: "pending" | "active" | "completed";
}

export interface FileInfo {
	name: string;
	size: number;
	type: string;
	lastModified: number;
	extension: string;
}

export interface UploadProgress {
	step: number;
	percentage: number;
	estimatedTime: number;
	currentAction: string;
}

export interface ValidationResult {
	isValid: boolean;
	error?: string;
	warnings?: string[];
}

// RUBRIC
export interface RubricCriteria {
	id: string;
	title: string;
	description?: string; // Optional as API puts it in levels
	weight?: number; // Optional as API allows calculating it or implicit
	maxPoints: number;
	levels?: {
		description: string;
		score: number;
	}[];
}

export interface RubricBuilderProps {
	rubric: Rubric;
	onAddCriteria: (criteria: RubricCriteria) => void;
	onUpdateCriteria: (id: string, updated: Partial<RubricCriteria>) => void;
	onDeleteCriteria: (id: string) => void;
}

export interface Rubric {
	id: string;
	name: string;
	description: string;
	criteria: RubricCriteria[];
	totalWeight: number;
	isActive: boolean;
}

export interface RubricTemplate {
	id: string;
	title: string;
	description: string;
	maxTotalScore: number;
	criteria?: RubricCriteria[];
}

export interface RubricLibraryProps {
	templates: RubricTemplate[];
	loading?: boolean;
	error?: any;
	onSelectTemplate: (template: RubricTemplate) => void;
	onDeleteTemplate: (id: string) => void;
	onCreateNew: () => void;
}

export interface RubricsData {
	rubrics: RubricTemplate[];
}

export interface RubricData {
	rubric: RubricTemplate;
}

export interface RubricsCreateProps {
	onStart: (data: {title: string; description: string}) => Promise<void> | void;
}

export interface CreateRubricInput {
	title: string;
	description: string;
	maxTotalScore: number;
	userId: string;
}

export interface UpdateRubricInput {
	id: string;
	title?: string;
	description?: string;
	maxTotalScore?: number;
}

// CRITERION
export interface CreateCriterionInput {
	rubric: string;
	title: string;
	maxPoints: number;
	levels?: {
		description: string;
		score: number;
	}[];
}

export interface UpdateCriterionInput {
	id: string;
	title?: string;
	maxPoints?: number;
	levels?: {
		description: string;
		score: number;
	}[];
}

// ANALYTICS
export interface AnalyticsData {
	period: string;
	averageGrade: number;
	passRate: number;
	totalEvaluations: number;
	averageTime: number;
	criteriaPerformance: Record<string, number>;
	gradeDistribution: {
		range: string;
		count: number;
		percentage: number;
	}[];
	studentPerformance: {
		id: string;
		name: string;
		grade: number;
		trend: "up" | "down" | "stable";
		riskLevel: "low" | "medium" | "high";
	}[];
	activityTrends: {
		date: string;
		uploads: number;
		evaluations: number;
		averageTime: number;
	}[];
}

export interface HeatmapData {
	criteria: string;
	weeks: string[];
	scores: number[][];
}

export interface Assignment {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	rubric?: {
		criteria: {
			name: string;
			description: string;
			weight: number;
		}[];
	};
	status: "pending" | "submitted" | "graded" | "overdue";
}

export interface AssignmentCardProps {
	assignment: Assignment;
	onSelect: (assignment: Assignment) => void;
}

export interface Step {
	id: number;
	title: string;
	description: string;
	status: "pending" | "active" | "completed";
	message: string;
}

export interface RubricCriterion {
	id: string;
	name: string;
	description: string;
	weight: number;
	maxScore: number;
	performanceLevels?: {
		label: string;
		description: string;
		minScore: number;
		maxScore: number;
	}[];
}

export interface AssignmentForm {
	title: string;
	description: string;
	dueDate: string;
	maxScore: number;
	rubric: {
		name: string;
		description: string;
		criteria: RubricCriterion[];
	};
}

export interface AIEvaluation {
	criteria: {
		name: string;
		score: number;
		maxScore: number;
		feedback: string;
		suggestions: string[];
	}[];
	overallScore: number;
	generalFeedback: string;
	confidence: number;
}

export interface TeacherOverride {
	criterionId: string;
	originalScore: number;
	newScore: number;
	reason: string;
	comments: string;
}

export interface Submission {
	id: string;
	studentName: string;
	studentEmail: string;
	assignmentTitle: string;
	submittedAt: string;
	status: "pending" | "graded" | "overdue" | "in_review";
	grade?: number;
	aiConfidence?: number;
	needsAttention: boolean;
}

export interface UserJourney {
	role: "student" | "teacher";
	journeyType: "upload" | "evaluation" | "creation" | "review";
	currentStep: number;
	totalSteps: number;
	estimatedTime: number;
	isComplete: boolean;
}

export interface StudentAssignment {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	rubric: {
		criteria: {
			name: string;
			description: string;
			weight: number;
		}[];
	};
	status: "pending" | "submitted" | "graded" | "overdue";
	grade?: number;
	feedback?: string;
}

export interface TeacherAssignment {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	totalStudents: number;
	submissions: number;
	pendingEvaluations: number;
	averageGrade: number;
	rubric: Rubric;
}

export interface TeacherEvaluation {
	overallScore: number;
	criteriaScores: Record<string, number>;
	overrides: TeacherOverride[];
	finalFeedback: string;
	published: boolean;
}

export interface RegisterFormData {
	name: string;
	last_name: string;
	documentType: DocumentType;
	documentNum: string;
	phone: string;
	email: string;
	password: string;
	confirmPassword: string;
	userType: UserRole;
	acceptTerms: boolean;
}

export interface AuthToastProps {
	type: "success" | "error" | "info" | "welcome";
	message: string;
	onClose: () => void;
	duration?: number;
}

export interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle: string;
	heroTitle?: React.ReactNode;
	heroSubtitle?: string;
	features?: Array<{
		icon: string;
		title: string;
		description: string;
		gradient: string;
	}>;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe: boolean;
}

export interface RegisterData {
	name: string;
	last_name: string;
	document_type?: string;
	document_num?: number;
	phone?: number;
	email: string;
	password: string;
	role: UserRole;
}

export interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: UserRole;
	redirectTo?: string;
}

export enum UserRole {
	STUDENT = "Estudiante",
	TEACHER = "Docente",
	ADMIN = "Administrador",
}

export enum DocumentType {
	CITIZENSHIP_CARD = "Cedula de ciudadania",
	PASSPORT = "Pasaporte",
	CIVIL_REGISRTRY = "Registro civil",
	FOREIGNER_CARD = "Cedula de extranjeria",
	MILITARY_ID = "Libreta militar",
	IDENTITY_CARD = "Tarjeta de identidad",
}
