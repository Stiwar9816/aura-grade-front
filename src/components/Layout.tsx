import React from "react";
import Head from "next/head";
import Header from "./Header";
import Sidebar from "./Sidebar";
import GuidedOnboarding from "./GuidedOnboarding";

interface LayoutProps {
	children: React.ReactNode;
	title?: string;
	hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({children, title, hideHeader}) => {
	const documentTitle = title ? `AuraGrade | ${title}` : "AuraGrade";

	return (
		<div className="min-h-screen bg-background-bone">
			<Head>
				<title>{documentTitle}</title>
				<meta name="robots" key="robots" content="noindex, nofollow" />
			</Head>
			<a href="#main-content" className="skip-link">Saltar al contenido</a>
			<Header />
			<div className="flex flex-col lg:flex-row">
				<Sidebar />
				<main id="main-content" tabIndex={-1} className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
					{title && !hideHeader && (
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-900">{title}</h1>

						</div>
					)}
					{children}
                    <div className="mx-auto mt-8 max-w-6xl"><GuidedOnboarding /></div>
				</main>
			</div>
		</div>
	);
};

export default Layout;
