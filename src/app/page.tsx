"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function HomePage() {
	const router = useRouter();

	useEffect(() => {
		const storedUser = localStorage.getItem("auraGrade_user");
		if (!storedUser) {
			router.push("/login");
			return;
		}

		try {
			const user = JSON.parse(storedUser);
			const role = user.role.toLowerCase();
			if (role === "administrador" || role === "teacher") {
				router.push("/teacher");
			} else {
				router.push("/student");
			}
		} catch (e) {
			router.push("/login");
		}
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background-bone">
			<div className="text-center">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500 mb-4"></div>
				<p className="text-gray-600">Redirigiendo...</p>
			</div>
		</div>
	);
}
