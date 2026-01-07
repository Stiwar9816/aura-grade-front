import React, {useEffect} from "react";
import {useRouter} from "next/router";
import useAuth from "@/hooks/useAuth";

const HomePage: React.FC = () => {
	const {user, isAuthenticated, isLoading} = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && isAuthenticated && user) {
			if (user.role === "student") {
				router.push("/student");
			} else if (user.role === "teacher") {
				router.push("/teacher");
			}
		} else if (!isLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [user, isAuthenticated, isLoading, router]);

	if (isLoading || isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background-bone">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500 mb-4"></div>
					<p className="text-gray-600">Redirigiendo a tu panel...</p>
				</div>
			</div>
		);
	}

	return null;
};

export default HomePage;
