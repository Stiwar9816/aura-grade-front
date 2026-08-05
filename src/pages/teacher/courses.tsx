import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import { ProtectedRoute } from "@/components/Auth";
import { USER_ROLE_STUDENTS } from "@/gql/User";
import { useCourse } from "@/hooks";
import { UserRole, UsersStats } from "@/interface";
import {
  faEdit,
  faGraduationCap,
  faMagnifyingGlass,
  faRemove,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SectionHeader from "@/components/Common/SectionHeader";
import {
  notifyError,
  notifyInfo,
  notifyLoading,
  notifySuccess,
  notifyWarning,
} from "@/utils/toastNotify";
import { useConfirm } from "@/context/ConfirmContext";
import { useAuth } from "@/hooks";

type CourseStudent = {
  id: string;
  name: string;
  last_name?: string | null;
  role?: string;
  email?: string | null;
  phone?: number | string | null;
};

type CourseSummary = {
  id: string;
  course_name: string;
  code_course: string;
  users?: CourseStudent[];
};

type StudentOption = UsersStats["users"][number];

const COURSE_MANAGEMENT_ROLES: UserRole[] = [
  UserRole.TEACHER,
  UserRole.ADMIN,
];

const CourseManagement: React.FC = () => {
  const confirm = useConfirm();
  const { user } = useAuth();
  const {
    courses,
    loading: coursesLoading,
    saveCourse,
    deleteCourse,
    assignCoursesToStudent,
  } = useCourse();

  const { data: studentsData, refetch: refetchStudents } =
    useQuery<UsersStats>(USER_ROLE_STUDENTS);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false); // New state for student modal
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const courseList = courses as CourseSummary[];
  const selectedCourse = courseList.find((c) => c.id === selectedCourseId);
  const allStudents = studentsData?.users || [];
  const canManageCourseCatalog = user?.role === UserRole.TEACHER;

  const getManagedCourseIds = (student: StudentOption) => {
    const assignedCourseIds = student.courses?.map((course) => course.id) || [];
    if (user?.role === UserRole.ADMIN) return assignedCourseIds;

    const visibleCourseIds = new Set(courseList.map((course) => course.id));
    return assignedCourseIds.filter((courseId) => visibleCourseIds.has(courseId));
  };

  // Filter students based on search - Fixed crash with safe navigation
  const filteredStudents = allStudents.filter(
    (s: StudentOption) =>
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
    const name = String(formData.get("name") || "").trim();
    const code = String(formData.get("code") || "").trim();

    if (!name || !code) {
      notifyWarning("Nombre y código del curso son obligatorios.");
      return;
    }

    const notificationId = notifyLoading(
      isEditing ? "Actualizando curso..." : "Creando curso...",
    );
    try {
      await saveCourse(
        name,
        code,
        isEditing && selectedCourse ? selectedCourse.id : undefined,
      );
      setShowModal(false);
      notifySuccess(
        isEditing
          ? `Curso "${name}" actualizado correctamente.`
          : `Curso "${name}" creado correctamente.`,
        { id: notificationId },
      );
    } catch (error) {
      console.error(error);
      notifyError(
        error instanceof Error ? error.message : "No se pudo guardar el curso.",
        { id: notificationId },
      );
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    const confirmed = await confirm({
      title: "Eliminar curso",
      message: `Se eliminará el curso ${selectedCourse.course_name}. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar curso",
      tone: "danger",
    });
    if (!confirmed) return;

    const notificationId = notifyLoading("Eliminando curso...");
    try {
      await deleteCourse(selectedCourse.id);
      setSelectedCourseId(null);
      notifySuccess(`Curso "${selectedCourse.course_name}" eliminado.`, {
        id: notificationId,
      });
    } catch (error) {
      console.error("Error deleting course", error);
      notifyError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el curso.",
        { id: notificationId },
      );
    }
  };

  const handleAddStudentToCourse = async (student: StudentOption) => {
    if (!selectedCourse) return;

    const notificationId = notifyLoading("Asignando estudiante al curso...");
    try {
      const nextCourseIds = Array.from(
        new Set([...getManagedCourseIds(student), selectedCourse.id]),
      );
      await assignCoursesToStudent(student.id, nextCourseIds);
      await refetchStudents();
      notifySuccess(
          `${student.name} ${student.last_name || ""}`.trim() +
          ` fue asignado a ${selectedCourse.course_name}.`,
        { id: notificationId },
      );
    } catch (error) {
      console.error("Error assigning student", error);
      notifyError(
        error instanceof Error
          ? error.message
          : "No se pudo asignar el estudiante.",
        { id: notificationId },
      );
    }
  };

  const handleRemoveStudentFromCourse = async (student: CourseStudent) => {
    if (!selectedCourse) return;

    const studentRecord = allStudents.find((item) => item.id === student.id);
    if (!studentRecord) {
      notifyError("No se encontró la información actual del estudiante.");
      return;
    }

    const notificationId = notifyLoading("Removiendo estudiante del curso...");
    try {
      const nextCourseIds = getManagedCourseIds(studentRecord).filter(
        (courseId) => courseId !== selectedCourse.id,
      );
      await assignCoursesToStudent(student.id, nextCourseIds);
      await refetchStudents();
      notifyInfo(
          `${student.name} ${student.last_name || ""}`.trim() +
          ` fue removido de ${selectedCourse.course_name}.`,
        { id: notificationId },
      );
    } catch (error) {
      console.error("Error removing student", error);
      notifyError(
        error instanceof Error
          ? error.message
          : "No se pudo remover el estudiante.",
        { id: notificationId },
      );
    }
  };

  const currentStudentIds = selectedCourse?.users?.map((u) => u.id) || [];

  return (
    <ProtectedRoute requiredRoles={COURSE_MANAGEMENT_ROLES}>
      <Layout title="Gestión de Cursos" hideHeader>
        <SectionHeader
          title="Gestión de Cursos"
          description={
            canManageCourseCatalog
              ? "Gestiona tus cursos y estudiantes"
              : "Asigna estudiantes a los cursos de tu institución"
          }
          className="mb-8"
        />
        {canManageCourseCatalog && (
          <div className="flex justify-end my-4">
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary flex items-center"
            >
              <span>Nuevo Curso</span>
            </button>
          </div>
        )}

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
                {courseList.map((course) => (
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
                    <Card className="border border-slate-200 bg-white/95 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">
                            {selectedCourse.course_name}
                          </h2>
                          <p className="text-slate-600 font-normal dark:text-slate-300">
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
                          {canManageCourseCatalog && (
                            <div className="flex gap-4">
                              <button
                                onClick={handleOpenEditModal}
                                className="p-2 text-slate-500 hover:text-electric-700 hover:bg-electric-50 rounded-xl transition-all dark:text-slate-400 dark:hover:text-blue-200 dark:hover:bg-blue-950/60"
                                title="Editar Curso"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={handleDeleteCourse}
                                className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all dark:text-slate-400 dark:hover:text-red-200 dark:hover:bg-red-950/60"
                                title="Eliminar Curso"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Current Students List */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 dark:text-slate-300">
                          Estudiantes en este curso (
                          {selectedCourse.users?.length || 0})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCourse.users?.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/90 shadow-sm transition-all hover:border-electric-200 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-500/60 dark:hover:bg-slate-800"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-electric-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-electric-500/20 ring-2 ring-white dark:ring-slate-900">
                                  {student.name[0] +
                                    (student.last_name
                                      ? student.last_name[0]
                                      : "")}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-sm text-slate-900 dark:text-slate-50">
                                    {student.name} {student.last_name}
                                  </p>
                                  <p className="truncate text-[12px] text-slate-600 font-medium dark:text-slate-300">
                                    {student.email}
                                  </p>
                                  <p className="text-[12px] text-slate-500 font-medium dark:text-slate-400">
                                    {student.phone || "Sin teléfono"}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveStudentFromCourse(student)
                                }
                                className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 dark:text-slate-500 dark:hover:bg-red-950/60 dark:hover:text-red-200 dark:focus:ring-red-800"
                                title="Eliminar del curso"
                              >
                                <FontAwesomeIcon icon={faRemove} />
                              </button>
                            </div>
                          ))}
                          {(!selectedCourse.users ||
                            selectedCourse.users.length === 0) && (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:bg-slate-900/70 dark:border-slate-700">
                              <p className="text-4xl mb-2">🎈</p>
                              <p className="text-slate-600 font-medium dark:text-slate-300">
                                Aún no hay estudiantes en este curso.
                              </p>
                              <p className="text-md text-slate-500 mt-1 dark:text-slate-400">
                                Usa el botón &quot;Alumnos&quot; para agregar.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50/80 rounded-[3rem] border-2 border-dashed border-slate-200 backdrop-blur-sm dark:bg-slate-900/60 dark:border-slate-700">
                    <div className="text-6xl mb-6 text-slate-300 dark:text-slate-600">
                      <FontAwesomeIcon icon={faGraduationCap} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 dark:text-slate-50">
                      Selecciona un curso
                    </h3>
                    <p className="text-slate-600 font-medium max-w-xs text-center px-6 dark:text-slate-300">
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
        {showModal && canManageCourseCatalog && (
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
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm dark:bg-slate-800 dark:text-slate-300">
                          {s.name[0] + (s.last_name ? s.last_name[0] : "")}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-sm text-slate-900 dark:text-slate-50">
                            {s.name} {s.last_name}
                          </p>
                          <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                            {s.email}
                          </p>
                        </div>
                      </div>
                      <button
                        disabled={currentStudentIds.includes(s.id)}
                        onClick={() => handleAddStudentToCourse(s)}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                          currentStudentIds.includes(s.id)
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400"
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
                    <p className="text-2xl mb-2">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </p>
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
