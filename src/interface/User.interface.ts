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
	redirectTo?: string;
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

export interface User {
	id: string;
	name: string;
	last_name: string;
	email: string;
	role: UserRole;
	token?: string;
	phone: number;
	isActive?: boolean;
	document_type?: string | null;
	document_num?: number | null;
	courses?: {id: string}[];
	assignments?: {id: string}[];
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
