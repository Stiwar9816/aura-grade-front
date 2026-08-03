import { FormEvent, useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faClockRotateLeft,
  faMagnifyingGlass,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import { ProtectedRoute } from "@/components/Auth";
import { AuditLog, AuditLogPage, UserRole } from "@/interface";

const emptyPage: AuditLogPage = {
  items: [],
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 1,
};

const actionLabels: Record<string, string> = {
  CREATE: "Creación",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
  REVIEW_INSTITUTION_USER: "Revisión de usuario",
  UPDATE_USER: "Actualización de usuario",
  BLOCK_USER: "Bloqueo de usuario",
  RESET_PASSWORD_AUTH: "Cambio de contraseña",
  ASSIGN_COURSES_TO_USER: "Asignación de cursos",
};

const resourceLabels: Record<string, string> = {
  Auth: "Sesión y seguridad",
  Institution: "Institución",
  User: "Usuario",
  Course: "Curso",
  Assignment: "Tarea",
  Rubric: "Rúbrica",
  Criterion: "Criterio",
  Submission: "Entrega",
  Evaluation: "Evaluación",
  ReEvaluation: "Reevaluación",
  Notifications: "Preferencias de notificación",
};

const fieldLabels: Record<string, string> = {
  name: "Nombre",
  last_name: "Apellidos",
  legalName: "Razón social",
  taxId: "NIT o identificación",
  email: "Correo electrónico",
  contactEmail: "Correo de contacto",
  phone: "Teléfono",
  address: "Dirección",
  city: "Ciudad",
  country: "País",
  website: "Sitio web",
  description: "Descripción",
  logoUrl: "Logo",
  isActive: "Estado de la institución",
  status: "Estado",
  approvalStatus: "Estado de aprobación",
  role: "Rol",
  userId: "Usuario",
  institutionId: "Institución",
  courseId: "Curso",
  courseIds: "Cursos",
  assignmentId: "Tarea",
  title: "Título",
  dueDate: "Fecha límite",
  rememberMe: "Mantener sesión iniciada",
  emailEnabled: "Notificaciones por correo",
  browserEnabled: "Notificaciones del navegador",
  newSubmissionsEnabled: "Avisos de nuevas entregas",
  gradesEnabled: "Avisos de calificaciones",
};

const valueLabels: Record<string, string> = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  Administrador: "Administrador",
  Docente: "Docente",
  Estudiante: "Estudiante",
  "[REDACTED]": "Información confidencial",
};

const ignoredContainers = new Set(["input", "variables", "data", "payload"]);

type ReadableChange = {
  label: string;
  value: string;
  protected: boolean;
};

const humanizeKey = (key: string) =>
  fieldLabels[key] ||
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (character) => character.toUpperCase());

const formatChangeValue = (value: unknown, key?: string) => {
  if (value === null || value === undefined || value === "")
    return "Sin información";
  if (key === "isActive" && typeof value === "boolean") {
    return value ? "Activa" : "Inactiva";
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number")
    return new Intl.NumberFormat("es-CO").format(value);
  if (typeof value !== "string") return String(value);
  if (valueLabels[value]) return valueLabels[value];

  const parsedDate = /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : null;
  if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
    return dateFormatter.format(parsedDate);
  }
  return value;
};

const readableChanges = (
  value: unknown,
  path: string[] = [],
): ReadableChange[] => {
  if ((value === null || value === undefined) && path.length === 0) return [];
  if (Array.isArray(value) && value.length === 0) return [];

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item !== "object" || item === null)) {
      const key = path.at(-1);
      return [
        {
          label: path.map(humanizeKey).join(" · ") || "Detalle",
          value:
            value.map((item) => formatChangeValue(item, key)).join(", ") ||
            "Sin información",
          protected: value.some((item) => item === "[REDACTED]"),
        },
      ];
    }
    return value.flatMap((item, index) =>
      readableChanges(item, [...path, `Elemento ${index + 1}`]),
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, nestedValue]) =>
        readableChanges(
          nestedValue,
          ignoredContainers.has(key) ? path : [...path, key],
        ),
    );
  }

  const key = path.at(-1);
  return [
    {
      label: path.map(humanizeKey).join(" · ") || "Detalle",
      value: formatChangeValue(value, key),
      protected: value === "[REDACTED]",
    },
  ];
};

const labelFor = (value: string) =>
  actionLabels[value] ||
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const resourceLabelFor = (value: string) =>
  resourceLabels[value] || humanizeKey(value);

const actionVariant = (action: string) => {
  if (action.includes("DELETE") || action.includes("BLOCK"))
    return "error" as const;
  if (action.includes("CREATE") || action.includes("APPROVE"))
    return "success" as const;
  if (action.includes("REVIEW")) return "warning" as const;
  return "info" as const;
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "medium",
});

const AuditLogsPage = () => {
  const [data, setData] = useState<AuditLogPage>(emptyPage);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as
        | AuditLogPage
        | { error?: string; message?: string }
        | null;
      if (!response.ok || !payload || !("items" in payload)) {
        throw new Error(
          (payload &&
            "error" in payload &&
            (payload.error || payload.message)) ||
            "No fue posible cargar la auditoría.",
        );
      }
      setData(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar la auditoría.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <Layout title="Auditoría del sistema">
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <div className="flex gap-3">
              <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5" />
              <p>
                Este historial es inmutable y está limitado a la institución del
                administrador. Los datos sensibles se ocultan antes de
                almacenarse.
              </p>
            </div>
          </div>
          <form onSubmit={submitSearch} className="flex gap-2">
            <label className="sr-only" htmlFor="audit-search">
              Buscar en auditoría
            </label>
            <input
              id="audit-search"
              className="input-primary min-w-64"
              placeholder="Actor, recurso o cambio..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit" className="btn-primary" aria-label="Buscar">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>
        </div>

        <Card noPadding>
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Cambios registrados
              </h2>
              <p className="text-sm text-gray-500">
                {data.total} {data.total === 1 ? "evento" : "eventos"}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              className="text-xl text-electric-500"
            />
          </div>

          {loading && (
            <div className="p-8 text-center text-gray-600">
              Cargando eventos...
            </div>
          )}
          {error && <div className="p-8 text-center text-red-700">{error}</div>}
          {!loading && !error && data.items.length === 0 && (
            <div className="p-10 text-center">
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className="mb-3 text-3xl text-gray-300"
              />
              <p className="font-medium text-gray-800">
                No hay eventos para mostrar
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Los nuevos cambios autenticados aparecerán desde este momento.
              </p>
            </div>
          )}

          {!loading && !error && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Fecha y hora</th>
                    <th className="px-6 py-3 font-semibold">Actor</th>
                    <th className="px-6 py-3 font-semibold">IP</th>
                    <th className="px-6 py-3 font-semibold">Acción</th>
                    <th className="px-6 py-3 font-semibold">Cambio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.items.map((log: AuditLog) => {
                    const changes = readableChanges(log.changes);
                    return (
                      <tr
                        key={log.id}
                        className="align-top hover:bg-gray-50/50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                          {dateFormatter.format(new Date(log.createdAt))}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {log.actorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.actorEmail || "Sin correo"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-600">
                          {log.ipAddress || "No disponible"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={actionVariant(log.action)}>
                            {labelFor(log.action)}
                          </Badge>
                          <p className="mt-2 text-xs text-gray-500">
                            {resourceLabelFor(log.resource)}
                          </p>
                        </td>
                        <td className="max-w-md px-6 py-4">
                          {changes.length > 0 ? (
                            <details>
                              <summary className="cursor-pointer font-medium text-electric-600">
                                Ver{" "}
                                {changes.length === 1
                                  ? "cambio"
                                  : `${changes.length} cambios`}
                              </summary>
                              <dl className="mt-2 max-h-64 divide-y divide-gray-100 overflow-auto rounded-lg border border-gray-100 bg-gray-50 px-3">
                                {changes.map((change, index) => (
                                  <div
                                    key={`${change.label}-${index}`}
                                    className="grid gap-1 py-3 sm:grid-cols-[minmax(120px,0.8fr)_minmax(0,1.2fr)] sm:gap-4"
                                  >
                                    <dt className="font-medium text-gray-700">
                                      {change.label}
                                    </dt>
                                    <dd
                                      className={`break-words ${
                                        change.protected
                                          ? "italic text-gray-500"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {change.value}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </details>
                          ) : (
                            <span className="text-gray-500">
                              Sin detalle adicional
                            </span>
                          )}
                          {log.resourceId && (
                            <p className="mt-2 break-all text-xs text-gray-400">
                              ID: {log.resourceId}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-600">
                Página {data.page} de {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="btn-ghost px-3 py-2 disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  type="button"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="btn-ghost px-3 py-2 disabled:opacity-40"
                  aria-label="Página siguiente"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </Layout>
    </ProtectedRoute>
  );
};

export default AuditLogsPage;
