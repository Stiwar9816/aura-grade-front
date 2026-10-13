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
	faBuildingColumns,
	faClockRotateLeft,
	faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar: React.FC = () => {
	const router = useRouter();
	const {user} = useAuth();

	const commonItems = [
		{
			path:
				user?.role === UserRole.STUDENT
					? "/student"
					: user?.role === UserRole.ADMIN
						? "/admin/approvals"
						: "/teacher",
			icon: <FontAwesomeIcon icon={faHouse} />,
			label: "Inicio",
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
			label: "Entregar",
			badge: null,
		},
		{
			path: "/evaluation",
			icon: <FontAwesomeIcon icon={faFileLines} />,
			label: "Resultados",
			badge: null,
		},
	];

	const teacherItems = [
		{
			path: "/teacher/assignments",
			icon: <FontAwesomeIcon icon={faPencil} />,
			label: "Tareas",
			badge: null,
		},
		{
			path: "/rubrics",
			icon: <FontAwesomeIcon icon={faBookOpen} />,
			label: "Rúbricas",
			badge: null,
		},
		{
			path: "/teacher/courses",
			icon: <FontAwesomeIcon icon={faPeopleRoof} />,
			label: "Cursos",
			badge: null,
		},
		{
			path: "/analytics",
			icon: <FontAwesomeIcon icon={faChartLine} />,
			label: "Reportes",
			badge: null,
		},
	];

	const administratorItems = [
		{
			path: "/admin/operations",
			icon: <FontAwesomeIcon icon={faGaugeHigh} />,
			label: "Operaciones",
			badge: null,
		},
		{
			path: "/teacher/courses",
			icon: <FontAwesomeIcon icon={faPeopleRoof} />,
			label: "Asignación de Cursos",
			badge: null,
		},
		{
			path: "/admin/import-users",
			icon: <FontAwesomeIcon icon={faCloudArrowUp} />,
			label: user?.isPlatformAdmin
				? "Importar administradores"
				: "Importar usuarios",
			badge: null,
		},
		...(user?.isPlatformAdmin
			? [
					{
						path: "/admin/institutions",
						icon: <FontAwesomeIcon icon={faBuildingColumns} />,
						label: "Instituciones",
						badge: null,
					},
				]
			: []),
		{
			path: "/admin/audit-logs",
			icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
			label: "Auditoría",
			badge: null,
		},
	];

	const menuItems = [
		...commonItems,
		...(user?.role === UserRole.STUDENT
			? studentItems
			: user?.role === UserRole.TEACHER
				? teacherItems
				: []),
		...(user?.role === UserRole.ADMIN ? administratorItems : []),
	];

	return (
		<aside className="w-full shrink-0 border-b border-gray-200 bg-white p-2 lg:min-h-[calc(100vh-80px)] lg:w-60 lg:border-b-0 lg:border-r lg:p-4">
			<nav aria-label="Navegación principal" className={`grid gap-1 ${menuItems.length === 4 ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-5"} lg:block lg:space-y-1`}>
				{menuItems.map((item) => {
					const isActive = router.pathname === item.path || (item.path !== "/student" && item.path !== "/teacher" && router.pathname.startsWith(`${item.path}/`));

					return (
						<Link
							key={item.path}
							href={item.path}
                            aria-current={isActive ? "page" : undefined}
							className={`flex min-h-12 items-center justify-center lg:justify-start px-2 lg:px-3 py-2 rounded-lg transition-colors duration-200 ${
								isActive
									? "bg-electric-50 text-electric-700 font-semibold"
									: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
							}`}
						>
							<div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 text-xs lg:text-sm">
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
			<div className="mt-8 hidden p-3 bg-gray-50 lg:block rounded-lg border border-gray-200">
				<h3 className="font-semibold text-gray-900 mb-1 text-sm">
					¿Necesitas ayuda?
				</h3>
				<p className="text-xs text-gray-600 mb-2">
					Resuelve dudas sobre entregas, evaluaciones y tu cuenta.
				</p>
				<Link href="/help" className="w-full btn-ghost text-xs py-1.5 inline-flex items-center justify-center text-center">
					Abrir centro de ayuda
				</Link>
			</div>
		</aside>
	);
};

export default Sidebar;
