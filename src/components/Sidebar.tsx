import React from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import {useAuth} from "@/hooks";
import {UserRole} from "@/interface";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
	faHouse,
	faPencil,
	faBookOpen,
	faPeopleRoof,
	faChartLine,
	faCloudArrowUp,
	faFileLines,
	faGraduationCap,
	faUserCheck,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar: React.FC = () => {
	const router = useRouter();
	const {user} = useAuth();

	const commonItems = [
		{
			path: user?.role === UserRole.STUDENT ? "/student" : "/teacher",
			icon: <FontAwesomeIcon icon={faHouse} />,
			label: "Panel de Inicio",
			badge: null,
		},
	];

	const studentItems = [
		{
			path: "/student/courses",
			icon: <FontAwesomeIcon icon={faGraduationCap} />,
			label: "Mis cursos",
			badge: null,
		},
		{
			path: "/upload",
			icon: <FontAwesomeIcon icon={faCloudArrowUp} />,
			label: "Subir Tarea",
			badge: null,
		},
		{
			path: "/evaluation",
			icon: <FontAwesomeIcon icon={faFileLines} />,
			label: "Mi progreso",
			badge: null,
		},
	];

	const teacherItems = [
		{
			path: "/teacher/assignments",
			icon: <FontAwesomeIcon icon={faPencil} />,
			label: "Crear Tarea",
			badge: null,
		},
		{
			path: "/rubrics",
			icon: <FontAwesomeIcon icon={faBookOpen} />,
			label: "Gestor de Rúbricas",
			badge: null,
		},
		{
			path: "/teacher/courses",
			icon: <FontAwesomeIcon icon={faPeopleRoof} />,
			label: "Gestión de Cursos",
			badge: null,
		},
		{
			path: "/analytics",
			icon: <FontAwesomeIcon icon={faChartLine} />,
			label: "Analíticas",
			badge: null,
		},
	];

	const administratorItems = [
		{
			path: "/admin/approvals",
			icon: <FontAwesomeIcon icon={faUserCheck} />,
			label: "Aprobaciones",
			badge: null,
		},
	];

	const menuItems = [
		...commonItems,
		...(user?.role === UserRole.STUDENT ? studentItems : teacherItems),
		...(user?.role === UserRole.ADMIN ? administratorItems : []),
	];

	return (
		<aside className="w-60 border-r border-gray-200 bg-white min-h-[calc(100vh-80px)] p-4">
			<nav className="space-y-2">
				{menuItems.map((item) => {
					const isActive = router.pathname === item.path;

					return (
						<Link
							key={item.path}
							href={item.path}
							className={`flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-200 ${
								isActive
									? "bg-electric-50 text-electric-500 font-semibold"
									: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
							}`}
						>
							<div className="flex items-center space-x-3">
								<span className="text-md ">{item.icon}</span>
								<span>{item.label}</span>
							</div>
							{item.badge && (
								<span
									className={`text-xs px-2 py-1 rounded-full ${
										isActive
											? "bg-electric-500 text-white"
											: "bg-gray-200 text-gray-700"
									}`}
								>
									{item.badge}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Sección de ayuda */}
			<div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 to-electric-50 rounded-xl border border-cyan-200">
				<h3 className="font-semibold text-gray-900 mb-1 text-sm">
					¿Necesitas ayuda?
				</h3>
				<p className="text-xs text-gray-600 mb-2">
					Consulta nuestra guía de evaluación con IA
				</p>
				<button className="w-full btn-ghost text-xs py-1.5">
					Ver Documentación
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
