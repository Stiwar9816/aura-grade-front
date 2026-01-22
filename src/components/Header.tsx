import React from "react";
import Image from "next/image";
import Link from "next/link";
import {UserMenu} from "./Auth";

const Header: React.FC = () => {
	return (
		<header className="bg-white border-b border-gray-200 px-6 py-3">
			<div className="flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center">
					<Link href="/">
						<Image
							src="/logo.png"
							alt="Logo"
							width={160}
							height={160}
							className="object-cover"
						/>
					</Link>
				</div>

				{/* Navegación y controles */}
				<div className="flex items-center space-x-4">
					<UserMenu />
				</div>
			</div>
		</header>
	);
};

export default Header;
