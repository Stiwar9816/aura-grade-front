import { useMutation, useQuery } from "@apollo/client/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClock,
  faUserGraduate,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import { ProtectedRoute } from "@/components/Auth";
import { PENDING_INSTITUTION_USERS, REVIEW_INSTITUTION_USER } from "@/gql/User";
import { InstitutionApprovalStatus, User, UserRole } from "@/interface";
import {
  notifyError,
  notifyLoading,
  notifySuccess,
} from "@/utils/toastNotify";
import { useConfirm } from "@/context/ConfirmContext";

type PendingUsersData = {
  pendingInstitutionUsers: User[];
};

const documentTypeLabels: Record<string, string> = {
  CITIZENSHIP_CARD: "Cédula de ciudadanía",
  PASSPORT: "Pasaporte",
  CIVIL_REGISRTRY: "Registro civil",
  FOREIGNER_CARD: "Cédula de extranjería",
  MILITARY_ID: "Libreta militar",
  IDENTITY_CARD: "Tarjeta de identidad",
  "Cedula de ciudadania": "Cédula de ciudadanía",
  "Cedula de extranjeria": "Cédula de extranjería",
};

const documentTypeLabel = (documentType?: string | null) =>
  documentType ? documentTypeLabels[documentType] || documentType : "Sin tipo";

const ApprovalsPage = () => {
  const confirm = useConfirm();
  const { data, loading, error, refetch } = useQuery<PendingUsersData>(
    PENDING_INSTITUTION_USERS,
  );
  const [reviewUser, { loading: reviewing }] = useMutation(
    REVIEW_INSTITUTION_USER,
  );

  const review = async (
    userId: string,
    status:
      | InstitutionApprovalStatus.APPROVED
      | InstitutionApprovalStatus.REJECTED,
  ) => {
    if (status === InstitutionApprovalStatus.REJECTED) {
      const confirmed = await confirm({
        title: "Rechazar solicitud institucional",
        message:
          "La persona no podrá ingresar a la plataforma con esta solicitud. ¿Deseas continuar?",
        confirmLabel: "Rechazar solicitud",
        tone: "danger",
      });
      if (!confirmed) return;
    }

    const notificationId = notifyLoading(
      status === InstitutionApprovalStatus.APPROVED
        ? "Aprobando usuario..."
        : "Rechazando solicitud...",
    );
    try {
      await reviewUser({ variables: { input: { userId, status } } });
      await refetch();
      notifySuccess(
        status === InstitutionApprovalStatus.APPROVED
          ? "Usuario aprobado correctamente."
          : "Solicitud rechazada.",
        { id: notificationId },
      );
    } catch (reviewError) {
      notifyError(
        reviewError instanceof Error
          ? reviewError.message
          : "No fue posible revisar la solicitud.",
        {
          id: notificationId,
          action: {
            label: "Reintentar",
            onClick: () => void review(userId, status),
          },
        },
      );
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <Layout title="Aprobaciones institucionales">
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          Verifica la identidad y la relación del solicitante con tu institución
          antes de aprobar. Una cuenta aprobada podrá iniciar sesión
          inmediatamente.
        </div>

        {loading && (
          <Card>
            <p className="text-gray-600">Cargando solicitudes pendientes...</p>
          </Card>
        )}

        {error && (
          <Card>
            <p className="text-red-700">
              No fue posible cargar las solicitudes: {error.message}
            </p>
          </Card>
        )}

        {!loading && !error && data?.pendingInstitutionUsers.length === 0 && (
          <Card className="text-center">
            <FontAwesomeIcon
              icon={faClock}
              className="mb-3 text-3xl text-gray-400"
            />
            <h2 className="text-lg font-semibold text-gray-900">
              No hay solicitudes pendientes
            </h2>
            <p className="mt-1 text-gray-600">
              Las nuevas cuentas de docentes y estudiantes aparecerán aquí.
            </p>
          </Card>
        )}

        <div className="grid gap-4">
          {data?.pendingInstitutionUsers.map((candidate) => (
            <Card key={candidate.id}>
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {candidate.name} {candidate.last_name}
                    </h2>
                    <Badge variant="warning">Pendiente</Badge>
                    <Badge variant="info">
                      <FontAwesomeIcon icon={faUserGraduate} className="mr-1" />
                      {candidate.role}
                    </Badge>
                  </div>
                  <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm text-gray-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-gray-800">Correo</dt>
                      <dd>{candidate.email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-800">Documento</dt>
                      <dd>
                        {documentTypeLabel(candidate.document_type)} ·{" "}
                        {candidate.document_num || "Sin número"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-800">Teléfono</dt>
                      <dd>{candidate.phone || "Sin teléfono"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() =>
                      void review(
                        candidate.id,
                        InstitutionApprovalStatus.REJECTED,
                      )
                    }
                    className="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faXmark} className="mr-2" />
                    Rechazar
                  </button>
                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() =>
                      void review(
                        candidate.id,
                        InstitutionApprovalStatus.APPROVED,
                      )
                    }
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Aprobar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ApprovalsPage;
