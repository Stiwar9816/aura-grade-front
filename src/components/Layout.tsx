import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
	children: React.ReactNode;
	title?: string;
}

const Layout: React.FC<LayoutProps> = ({children, title}) => {
	return (
		<div className="min-h-screen bg-background-bone">
			<Header />
			<div className="flex">
				<Sidebar />
				<main className="flex-1 p-6 md:p-8">
					{title && (
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-900">{title}</h1>
							<p className="text-gray-600 mt-2">Sistema de Evaluación con IA</p>
						</div>
					)}
					{children}
				</main>
			</div>
		</div>
	);
};

export default Layout;
