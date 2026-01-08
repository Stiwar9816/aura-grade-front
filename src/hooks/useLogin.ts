"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {UserRole} from "@/types";
import useAuth from "./useAuth";

export const useLogin = () => {
	const router = useRouter();
	const {login: loginCore, isLoading, error} = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value, type, checked} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleTogglePassword = () => setShowPassword(!showPassword);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await loginCore(formData);

		if (result.success && result.user) {
			const role = result.user.role;
			const dest =
				role === UserRole.ADMIN || role === UserRole.TEACHER
					? "/teacher"
					: "/student";
			router.push(dest);
		}
	};

	const handleSocialLogin = (provider: string) => {
		console.log(`Login with ${provider}`);
	};

	return {
		formData,
		setFormData,
		showPassword,
		isLoading,
		error,
		handleChange,
		handleTogglePassword,
		handleSubmit,
		handleSocialLogin,
	};
};

export default useLogin;
