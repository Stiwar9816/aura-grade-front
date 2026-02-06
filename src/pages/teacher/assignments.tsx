import React from "react";
import Layout from "@/components/Layout";
import AssignmentCreator from "@/components/Teacher/AssignmentCreator";
import {ProtectedRoute} from "@/components/Auth";
import SectionHeader from "@/components/Common/SectionHeader";
import {UserRole} from "@/interface";

const AssignmentsPage: React.FC = () => {
	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout>
				<div className="space-y-8">
					<SectionHeader
						title="Crear Nueva Tarea"
						description="Gestiona tus actividades académicas y configura los criterios de evaluación."
						className="mb-8"
					/>
					<AssignmentCreator />
				</div>
			</Layout>
		</ProtectedRoute>
	);
};

export default AssignmentsPage;
