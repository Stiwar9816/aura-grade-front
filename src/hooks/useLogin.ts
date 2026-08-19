"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {UserRole} from "@/interface";
import {useAuth} from "./";

export const useLogin = () => {
	const router = useRouter();
	const {login: loginCore, verifyOtp, isLoading, error} = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [otp, setOtp] = useState("");
	const [twoFactorChallenge, setTwoFactorChallenge] = useState<{
		challengeToken: string;
		expiresAt?: string;
		otpAuthUri?: string;
		requiresSetup: boolean;
		setupKey?: string;
	} | null>(null);

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
		if (twoFactorChallenge) {
			const result = await verifyOtp(twoFactorChallenge.challengeToken, otp);
			if (result.success && result.user) redirectForRole(result.user.role);
			return;
		}
		const result = await loginCore(formData);
		if (result.requiresTwoFactor && result.challengeToken) {
			setOtp("");
			setTwoFactorChallenge({
				challengeToken: result.challengeToken,
				expiresAt: result.expiresAt,
				otpAuthUri: result.otpAuthUri,
				requiresSetup: Boolean(result.requiresTwoFactorSetup),
				setupKey: result.setupKey,
			});
			return;
		}

		if (result.success && result.user) {
			redirectForRole(result.user.role);
		}
	};

	const redirectForRole = (role: UserRole) => {
		const destination =
			role === UserRole.ADMIN || role === UserRole.TEACHER
				? "/teacher"
				: "/student";
		router.push(destination);
	};

	const cancelTwoFactor = () => {
		setOtp("");
		setTwoFactorChallenge(null);
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
		otp,
		setOtp,
		twoFactorChallenge,
		cancelTwoFactor,
		handleChange,
		handleTogglePassword,
		handleSubmit,
		handleSocialLogin,
	};
};
