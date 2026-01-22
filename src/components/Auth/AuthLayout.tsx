import Image from "next/image";
import {AuthLayoutProps} from "@/types";

export const AuthLayout: React.FC<AuthLayoutProps> = ({
	children,
	title,
	subtitle,
	heroTitle,
	heroSubtitle,
	features,
}) => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background-bone to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
				{/* Left Side - Branding & Info */}
				<div className="hidden lg:block">
					<div className="max-w-lg">
						{/* Logo */}
						<div className="mb-4">
							<div className="flex items-center gap-3">
								<Image
									src="/logo.png"
									alt="Logo"
									width={300}
									height={300}
									className="object-contain"
								/>
							</div>
						</div>

						{/* Hero Section */}
						<div className="mb-10">
							<h2 className="text-4xl font-bold text-gray-900 mb-4">
								{heroTitle || (
									<>
										Transforma la evaluación{" "}
										<span className="text-electric-500">con IA</span>
									</>
								)}
							</h2>
							<p className="text-lg text-gray-600 mb-8">
								{heroSubtitle ||
									"La plataforma que combina inteligencia artificial con pedagogía para ofrecer evaluaciones precisas, rápidas y significativas."}
							</p>
						</div>

						{/* Features */}
						{features && (
							<div className="space-y-6">
								{features.map((feature, idx) => (
									<div key={idx} className="flex items-start gap-4">
										<div
											className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-xl`}
										>
											<span className="text-white text-xl">{feature.icon}</span>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900 mb-1">
												{feature.title}
											</h3>
											<p className="text-gray-600">{feature.description}</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Right Side - Form */}
				<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
					{/* Mobile Logo */}
					<div className="lg:hidden mb-8">
						{/* Logo */}
						<div className="mb-4">
							<div className="flex items-center gap-3">
								<Image
									src="/logo.png"
									alt="Logo"
									width={250}
									height={250}
									className="object-contain align-center"
								/>
							</div>
						</div>
					</div>

					<div className="mb-8">
						<h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
						<p className="text-gray-600">{subtitle}</p>
					</div>

					{children}
				</div>
			</div>
		</div>
	);
};
