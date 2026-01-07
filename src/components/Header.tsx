import React, {useState} from "react";
import Image from "next/image";
import Link from "next/link";

const Header: React.FC = () => {
	const [userType, setUserType] = useState<"student" | "teacher">("teacher");

	return (
		<header className="bg-white border-b border-gray-200 px-6 py-3">
			<div className="flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center">
					<Link href="/">
						<Image
							src="/logo.png"
							alt="Logo"
							width={180}
							height={180}
							className="object-cover"
						/>
					</Link>
				</div>

				{/* Navegación y controles */}
				<div className="flex items-center space-x-4">
					{/* Avatar de usuario */}
					<div className="flex items-center space-x-3">
						<div className="w-12 h-12 bg-gradient-to-r from-electric-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
							{userType === "teacher" ? "SA" : "EA"}
						</div>
						<div className="hidden md:block">
							<p className="font-medium text-gray-900">
								{userType === "teacher" ? "Stiwar Asprilla" : "Ernesto Andrade"}
							</p>
							<p className="text-sm text-gray-600">
								{userType === "teacher" ? "Docente" : "Estudiante"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
