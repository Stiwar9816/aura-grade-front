import React from "react";
import Image from "next/image";
import Link from "next/link";
import {UserMenu} from "./Auth";
import NotificationCenter from "./Notifications/NotificationCenter";
import FeedbackButton from "./FeedbackButton";

const Header: React.FC = () => {
	return (
		<header className="bg-white border-b border-gray-200 px-3 py-3 sm:px-6 min-h-[72px]">
			<div className="flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center">
					<Link href="/">
						<Image
							src="/logo.png"
							alt="AuraGrade — Inicio"
							width={160}
							height={61}
							className="h-auto w-28 object-contain sm:w-40"
						/>
					</Link>
				</div>

				{/* Navegación y controles */}
				<div className="flex items-center gap-2 sm:gap-4">
					<FeedbackButton />
					<NotificationCenter />
					<UserMenu />
				</div>
			</div>
		</header>
	);
};

export default Header;
