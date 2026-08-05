export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	sessionErrorCode:
		| "RATE_LIMITED"
		| "SERVICE_UNAVAILABLE"
		| "UNAUTHENTICATED"
		| null;
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
	institutionId: string;
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

export interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: UserRole;
	requiredRoles?: UserRole[];
	redirectTo?: string;
}

export interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	subtitle: string;
	heroTitle?: React.ReactNode;
	heroSubtitle?: string;
	features?: Array<{
		icon: React.ReactNode;
		title: string;
		description: string;
		gradient: string;
	}>;
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
	institutionId: string;
	acceptTerms: boolean;
}

export enum InstitutionApprovalStatus {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
}

export interface Institution {
	id: string;
	name: string;
	legalName?: string | null;
	taxId?: string | null;
	contactEmail?: string | null;
	phone?: string | null;
	address?: string | null;
	city?: string | null;
	website?: string | null;
	logoUrl?: string | null;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export type InstitutionInput = Omit<
	Institution,
	"id" | "isActive" | "createdAt" | "updatedAt"
>;

export interface AuditLog {
	id: string;
	actorUserId?: string | null;
	actorName: string;
	actorEmail?: string | null;
	institutionId: string;
	ipAddress?: string | null;
	action: string;
	resource: string;
	resourceId?: string | null;
	changes?: Record<string, unknown> | null;
	requestId?: string | null;
	path?: string | null;
	createdAt: string;
}

export interface AuditLogPage {
	items: AuditLog[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface User {
	id: string;
	name: string;
	last_name: string;
	email: string;
	role: UserRole;
	phone: number;
	isActive?: boolean;
	isPlatformAdmin?: boolean;
	approvalStatus?: InstitutionApprovalStatus;
	institution?: Institution;
	institutionId?: string;
	document_type?: string | null;
	document_num?: number | null;
	courses?: {id: string}[];
	assignments?: {id: string; title?: string; isActive?: boolean; dueDate?: string}[];
}

export interface UpdateUserInput {
	id: string;
	password?: string | null;
	role?: UserRole | null;
	isActive?: boolean | null;
	document_num?: number | null;
	document_type?: string | null;
	last_name?: string | null;
	name?: string | null;
	phone?: number | null;
}

export interface UpdateOwnProfileInput {
	name?: string | null;
	last_name?: string | null;
	email?: string | null;
	phone?: number | null;
	document_type?: string | null;
	document_num?: number | null;
}

export interface AssignCoursesInput {
	userId: string;
	courseIds: string[];
}

export interface UsersStats {
	users: {
		id: string;
		name: string;
		last_name: string;
		role: string;
		isActive: boolean;
		email?: string | null;
		phone?: number | string | null;
		submissions: {
			id: string;
			status: string;
			evaluation: {
				id: string;
				status: string;
				totalScore: number;
			};
			assignment?: {
				rubric?: {
					maxTotalScore?: number;
				};
			};
		}[];
		assignments: {
			id: string;
			title: string;
			isActive: boolean;
			dueDate: string;
		}[];
		courses: {
			id: string;
			course_name: string;
		}[];
	}[];
}
