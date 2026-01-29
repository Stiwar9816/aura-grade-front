import React, {useState} from "react";
import {useQuery} from "@apollo/client/react";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import {ProtectedRoute} from "@/components/Auth";
import {USER_ROLE_STUDENTS} from "@/gql/User";
import {useCourse} from "@/hooks";
import {UserRole, UsersStats} from "@/types";

const CourseManagement: React.FC = () => {
	const {
		courses,
		loading: coursesLoading,
		saveCourse,
		deleteCourse,
		addStudentToCourse,
		removeStudentFromCourse,
	} = useCourse();

	const {data: studentsData, loading: studentsLoading} =
		useQuery<UsersStats>(USER_ROLE_STUDENTS);

	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [showStudentModal, setShowStudentModal] = useState(false); // New state for student modal
	const [isEditing, setIsEditing] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const selectedCourse = courses.find((c: any) => c.id === selectedCourseId);
	const allStudents = studentsData?.users || [];

	// Filter students based on search - Fixed crash with safe navigation
	const filteredStudents = allStudents.filter(
		(s: any) =>
			s.isActive &&
			s.role === UserRole.STUDENT &&
			((s.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
				(s.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
				(s.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())),
	);

	const handleOpenCreateModal = () => {
		setIsEditing(false);
		setShowModal(true);
	};

	const handleOpenEditModal = () => {
		if (!selectedCourse) return;
		setIsEditing(true);
		setShowModal(true);
	};

	const handleSubmitCourse = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const code = formData.get("code") as string;

		try {
			await saveCourse(
				name,
				code,
				isEditing && selectedCourse ? selectedCourse.id : undefined,
			);
			setShowModal(false);
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeleteCourse = async () => {
		if (!selectedCourse) return;
		if (
			window.confirm(
				`¿Estás seguro de que deseas eliminar el curso ${selectedCourse.course_name}? Esta acción no se puede deshacer.`,
			)
		) {
			try {
				await deleteCourse(selectedCourse.id);
				setSelectedCourseId(null);
			} catch (error) {
				console.error("Error deleting course", error);
			}
		}
	};

	const currentStudentIds = selectedCourse?.users?.map((u: any) => u.id) || [];

	return (
		<ProtectedRoute requiredRole={UserRole.TEACHER}>
			<Layout title="Gestión de Cursos">
				<div className="flex justify-end my-6">
					<button
						onClick={handleOpenCreateModal}
						className="btn-primary flex items-center"
					>
						<span>Nuevo Curso</span>
					</button>
				</div>

				<div className="max-w-7xl mx-auto space-y-6">
					{coursesLoading ? (
						<div className="text-center py-10">Cargando cursos...</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Courses List */}
							<div className="space-y-4">
								<h3 className="text-lg font-bold text-gray-900 border-b pb-2">
									Lista de Cursos
								</h3>
								{courses.map((course: any) => (
									<Card
										key={course.id}
										hoverable
										onClick={() => setSelectedCourseId(course.id)}
										className={`cursor-pointer transition-all duration-300 border-2 ${
											selectedCourseId === course.id
												? "border-electric-500 bg-electric-50/30 ring-4 ring-electric-500/10"
												: "border-transparent"
										}`}
									>
										<div className="flex justify-between items-start">
											<div>
												<p className="text-xs font-black text-electric-600 uppercase tracking-widest mb-1">
													{course.code_course}
												</p>
												<h4 className="font-bold text-gray-900 text-lg">
													{course.course_name}
												</h4>
											</div>
											<Badge variant="info">
												{course.users?.length || 0} Est.
											</Badge>
										</div>
									</Card>
								))}
							</div>

							{/* Course Details & Student Management */}
							<div className="lg:col-span-2">
								{selectedCourse ? (
									<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
										<Card className="bg-gradient-to-br from-white to-gray-50/50">
											<div className="flex justify-between items-center mb-6">
												<div>
													<h2 className="text-xl font-black text-gray-900">
														{selectedCourse.course_name}
													</h2>
													<p className="text-gray-500 font-normal">
														Código: {selectedCourse.code_course}
													</p>
												</div>

												<div className="flex items-center gap-4">
													<button
														onClick={() => {
															setSearchTerm("");
															setShowStudentModal(true);
														}}
														className="my-4 p-2 bg-electric-500 text-white rounded-xl shadow-lg shadow-electric-500/20 hover:bg-electric-600 transition-all flex items-center gap-2 px-4 font-medium text-sm"
														title="Asignar Estudiantes"
													>
														Asignar Estudiantes
													</button>
													<div className="flex gap-4">
														<button
															onClick={handleOpenEditModal}
															className="p-2 text-gray-400 hover:text-electric-600 hover:bg-electric-50 rounded-xl transition-all"
															title="Editar Curso"
														>
															✏️
														</button>
														<button
															onClick={handleDeleteCourse}
															className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
															title="Eliminar Curso"
														>
															🗑️
														</button>
													</div>
												</div>
											</div>

											{/* Current Students List */}
											<div className="space-y-4">
												<h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
													Estudiantes en este curso (
													{selectedCourse.users?.length || 0})
												</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{selectedCourse.users?.map((student: any) => (
														<div
															key={student.id}
															className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
														>
															<div className="flex items-center gap-3">
																<div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-electric-500/10">
																	{student.name[0] +
																		(student.last_name
																			? student.last_name[0]
																			: "")}
																</div>
																<div>
																	<p className="font-bold text-sm text-gray-900">
																		{student.name} {student.last_name}
																	</p>
																	<p className="text-[12px] text-gray-500 font-medium">
																		{student.email}
																		<br />
																		{student.phone}
																	</p>
																</div>
															</div>
															<button
																onClick={() =>
																	removeStudentFromCourse(
																		selectedCourse.id,
																		student.id,
																		currentStudentIds,
																	)
																}
																className="text-gray-300 hover:text-red-500 transition-colors p-2"
																title="Eliminar del curso"
															>
																🗑️
															</button>
														</div>
													))}
													{(!selectedCourse.users ||
														selectedCourse.users.length === 0) && (
														<div className="col-span-full py-12 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
															<p className="text-4xl mb-2">🎈</p>
															<p className="text-gray-500 font-medium">
																Aún no hay estudiantes en este curso.
															</p>
															<p className="text-md text-gray-400 mt-1">
																Usa el botón "Alumnos" para agregar.
															</p>
														</div>
													)}
												</div>
											</div>
										</Card>
									</div>
								) : (
									<div className="h-full flex flex-col items-center justify-center py-20 bg-white/40 rounded-[3rem] border-2 border-dashed border-gray-200 backdrop-blur-sm">
										<div className="text-6xl mb-6">🎓</div>
										<h3 className="text-xl font-black text-gray-900 mb-2">
											Selecciona un curso
										</h3>
										<p className="text-gray-500 font-medium max-w-xs text-center px-6">
											Elige un curso de la izquierda para ver su detalle y
											gestionar los estudiantes.
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Create/Edit Course Modal */}
				{showModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
						<Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-xl font-black text-gray-900">
									{isEditing ? "Editar Curso" : "Crear Nuevo Curso"}
								</h2>
								<button
									onClick={() => setShowModal(false)}
									className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
								>
									✕
								</button>
							</div>
							<form onSubmit={handleSubmitCourse} className="space-y-4">
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-1">
										Nombre del Curso
									</label>
									<input
										name="name"
										required
										defaultValue={isEditing ? selectedCourse?.course_name : ""}
										type="text"
										placeholder="Ej: Matemáticas Avanzadas"
										className="input-primary"
									/>
								</div>
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-1">
										Código del Curso
									</label>
									<input
										name="code"
										required
										defaultValue={isEditing ? selectedCourse?.code_course : ""}
										type="text"
										placeholder="Ej: MATH202"
										className="input-primary uppercase"
									/>
								</div>
								<div className="pt-4 flex gap-3">
									<button
										type="button"
										onClick={() => setShowModal(false)}
										className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
									>
										Cancelar
									</button>
									<button type="submit" className="flex-1 btn-primary">
										{isEditing ? "Guardar Cambios" : "Crear Curso"}
									</button>
								</div>
							</form>
						</Card>
					</div>
				)}

				{/* Assign Student Modal */}
				{showStudentModal && selectedCourse && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
						<Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
							<div className="flex justify-between items-center mb-6 shrink-0">
								<div>
									<h2 className="text-xl font-black text-gray-900">
										Asignar Estudiantes
									</h2>
									<p className="text-sm text-gray-500">
										{selectedCourse.course_name}
									</p>
								</div>
								<button
									onClick={() => setShowStudentModal(false)}
									className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
								>
									✕
								</button>
							</div>

							<div className="mb-4 shrink-0">
								<div className="relative">
									<input
										type="text"
										placeholder="Buscar estudiante por nombre"
										className="input-primary"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										autoFocus
									/>
								</div>
							</div>

							<div className="overflow-y-auto pr-2 space-y-2 flex-1">
								{filteredStudents.length > 0 ? (
									filteredStudents.map((s: any) => (
										<div
											key={s.id}
											className="flex items-center justify-between p-3 hover:bg-gray-50 border border-gray-100 rounded-xl transition-colors"
										>
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
													{s.name[0] + (s.last_name ? s.last_name[0] : "")}
												</div>
												<div>
													<p className="font-bold text-sm text-gray-900">
														{s.name} {s.last_name}
													</p>
													<p className="text-xs text-gray-500">{s.email}</p>
												</div>
											</div>
											<button
												disabled={currentStudentIds.includes(s.id)}
												onClick={() =>
													addStudentToCourse(
														selectedCourse.id,
														s.id,
														currentStudentIds,
													)
												}
												className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
													currentStudentIds.includes(s.id)
														? "bg-gray-100 text-gray-400 cursor-not-allowed"
														: "bg-electric-500 text-white hover:bg-electric-600 shadow-lg shadow-electric-500/20"
												}`}
											>
												{currentStudentIds.includes(s.id)
													? "Asignado"
													: "Asignar"}
											</button>
										</div>
									))
								) : (
									<div className="text-center py-10 text-gray-500">
										<p className="text-2xl mb-2">🔍</p>
										<p>No se encontraron estudiantes activos.</p>
									</div>
								)}
							</div>

							<div className="pt-4 mt-4 border-t border-gray-100 shrink-0 flex justify-end">
								<button
									onClick={() => setShowStudentModal(false)}
									className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
								>
									Cerrar
								</button>
							</div>
						</Card>
					</div>
				)}
			</Layout>
		</ProtectedRoute>
	);
};

export default CourseManagement;
