import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faChevronLeft,
  faChevronRight,
  faGlobe,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faPowerOff,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Layout from "@/components/Layout";
import Card from "@/components/Common/Card";
import Badge from "@/components/Common/Badge";
import { ProtectedRoute } from "@/components/Auth";
import { Institution, InstitutionInput, UserRole } from "@/interface";
import {
  notifyError,
  notifyLoading,
  notifySuccess,
} from "@/utils/toastNotify";
import { useConfirm } from "@/context/ConfirmContext";

const INSTITUTIONS_PAGE_SIZE = 5;

const emptyForm: InstitutionInput = {
  name: "",
  legalName: "",
  taxId: "",
  contactEmail: "",
  phone: "",
  address: "",
  city: "",
  website: "",
  logoUrl: "",
};

const institutionToForm = (institution: Institution): InstitutionInput => ({
  name: institution.name,
  legalName: institution.legalName ?? "",
  taxId: institution.taxId ?? "",
  contactEmail: institution.contactEmail ?? "",
  phone: institution.phone ?? "",
  address: institution.address ?? "",
  city: institution.city ?? "",
  website: institution.website ?? "",
  logoUrl: institution.logoUrl ?? "",
});

const institutionInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

const InstitutionLogo = ({ institution }: { institution: Institution }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(institution.logoUrl) && !imageFailed;

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
      {showImage ? (
        // La URL es administrable y puede pertenecer a cualquier CDN institucional.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={institution.logoUrl ?? undefined}
          alt={`Logo de ${institution.name}`}
          className="h-full w-full object-contain p-2"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="text-lg font-bold text-electric-700" aria-hidden="true">
          {institutionInitials(institution.name)}
        </span>
      )}
    </div>
  );
};

const responseMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") return fallback;
  const candidate = payload as { error?: unknown; message?: unknown };
  const message = candidate.error ?? candidate.message;
  return Array.isArray(message)
    ? message.join(" ")
    : typeof message === "string"
      ? message
      : fallback;
};

const InstitutionsPage = () => {
  const confirm = useConfirm();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<InstitutionInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] =
    useState<Institution | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  const filteredInstitutions = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(search.trim());
    if (!normalizedSearch) return institutions;

    return institutions.filter((institution) =>
      [
        institution.name,
        institution.legalName,
        institution.taxId,
        institution.contactEmail,
        institution.city,
      ].some((value) =>
        normalizeSearchValue(value ?? "").includes(normalizedSearch),
      ),
    );
  }, [institutions, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInstitutions.length / INSTITUTIONS_PAGE_SIZE),
  );
  const visibleInstitutions = filteredInstitutions.slice(
    (page - 1) * INSTITUTIONS_PAGE_SIZE,
    page * INSTITUTIONS_PAGE_SIZE,
  );

  const loadInstitutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/institutions", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as
        | Institution[]
        | null;
      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(
          responseMessage(payload, "No fue posible cargar las instituciones."),
        );
      }
      setInstitutions(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar las instituciones.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInstitutions();
  }, [loadInstitutions]);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!isInstitutionModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameInputRef.current?.focus();
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingRef.current) {
        setIsInstitutionModalOpen(false);
        setEditingInstitution(null);
        setForm(emptyForm);
      }
    };
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isInstitutionModalOpen]);

  const closeInstitutionModal = () => {
    if (saving) return;
    setIsInstitutionModalOpen(false);
    setEditingInstitution(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setEditingInstitution(null);
    setForm(emptyForm);
    setIsInstitutionModalOpen(true);
  };

  const openEditModal = (institution: Institution) => {
    setEditingInstitution(institution);
    setForm(institutionToForm(institution));
    setIsInstitutionModalOpen(true);
  };

  const setField = (field: keyof InstitutionInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveInstitution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const notificationId = notifyLoading(
      editingInstitution
        ? "Guardando cambios de la institución..."
        : "Creando institución...",
    );
    try {
      const payload = editingInstitution
        ? Object.fromEntries(
            Object.entries(form).map(([key, value]) => [
              key,
              value?.trim() || (key === "name" ? "" : null),
            ]),
          )
        : Object.fromEntries(
            Object.entries(form).filter(([, value]) => value?.trim()),
          );
      const response = await fetch(
        editingInstitution
          ? `/api/admin/institutions/${encodeURIComponent(editingInstitution.id)}`
          : "/api/admin/institutions",
        {
          method: editingInstitution ? "PATCH" : "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        throw new Error(
          responseMessage(
            data,
            editingInstitution
              ? "No fue posible actualizar la institución."
              : "No fue posible crear la institución.",
          ),
        );
      }
      await loadInstitutions();
      setIsInstitutionModalOpen(false);
      setEditingInstitution(null);
      setForm(emptyForm);
      notifySuccess(
        editingInstitution
          ? "Institución actualizada correctamente."
          : "Institución creada correctamente.",
        { id: notificationId },
      );
    } catch (saveError) {
      notifyError(
        saveError instanceof Error
          ? saveError.message
          : editingInstitution
            ? "No fue posible actualizar la institución."
            : "No fue posible crear la institución.",
        { id: notificationId },
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleInstitution = async (institution: Institution) => {
    const action = institution.isActive ? "desactivar" : "activar";
    const confirmed = await confirm({
      title: `${institution.isActive ? "Desactivar" : "Activar"} institución`,
      message: `¿Confirmas que deseas ${action} ${institution.name}?`,
      confirmLabel: institution.isActive ? "Desactivar" : "Activar",
      tone: institution.isActive ? "danger" : "info",
    });
    if (!confirmed) return;

    const notificationId = notifyLoading(
      `${institution.isActive ? "Desactivando" : "Activando"} institución...`,
    );
    try {
      const response = await fetch(
        `/api/admin/institutions/${encodeURIComponent(institution.id)}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ isActive: !institution.isActive }),
        },
      );
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        throw new Error(
          responseMessage(data, `No fue posible ${action} la institución.`),
        );
      }
      await loadInstitutions();
      notifySuccess(
        `Institución ${institution.isActive ? "desactivada" : "activada"}.`,
        { id: notificationId },
      );
    } catch (toggleError) {
      notifyError(
        toggleError instanceof Error
          ? toggleError.message
          : `No fue posible ${action} la institución.`,
        {
          id: notificationId,
          action: {
            label: "Reintentar",
            onClick: () => void toggleInstitution(institution),
          },
        },
      );
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <Layout title="Gestión de instituciones" hideHeader={true}>
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900">
                  Instituciones registradas
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {institutions.length} entidades configuradas en la plataforma
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <label className="sr-only" htmlFor="institution-search">
                    Buscar instituciones
                  </label>
      
                  <input
                    id="institution-search"
                    type="search"
                    className="input-primary w-full sm:w-72"
                    placeholder="Buscar institución"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="btn-primary shrink-0"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Nueva institución
                </button>
              </div>
            </div>

            {loading && <Card>Cargando instituciones...</Card>}
            {error && <Card className="text-red-700">{error}</Card>}
            {!loading && !error && institutions.length === 0 && (
              <Card className="text-center text-gray-600">
                Todavía no hay instituciones registradas.
              </Card>
            )}

            {!loading &&
              !error &&
              institutions.length > 0 &&
              filteredInstitutions.length === 0 && (
                <Card className="text-center text-gray-600">
                  No se encontraron instituciones que coincidan con la
                  búsqueda.
                </Card>
              )}

            {!loading &&
              !error &&
              visibleInstitutions.map((institution) => (
                <Card key={institution.id}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 gap-4">
                      <InstitutionLogo
                        key={`${institution.id}:${institution.logoUrl ?? ""}`}
                        institution={institution}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {institution.name}
                          </h3>
                          <Badge
                            variant={institution.isActive ? "success" : "error"}
                          >
                            {institution.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="font-medium text-gray-800">NIT</dt>
                            <dd className="text-gray-600">
                              {institution.taxId || "Sin NIT"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-800">
                              Contacto
                            </dt>
                            <dd className="text-gray-600">
                              {institution.contactEmail || "Sin contacto"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-800">
                              Dirección
                            </dt>
                            <dd className="text-gray-600">
                              {[institution.address, institution.city]
                                .filter(Boolean)
                                .join(", ") || "Sin dirección"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-800">
                              Teléfono
                            </dt>
                            <dd className="text-gray-600">
                              {institution.phone || "Sin teléfono"}
                            </dd>
                          </div>
                        </dl>
                        {institution.website && (
                          <a
                            href={institution.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-electric-600 hover:underline"
                          >
                            <FontAwesomeIcon icon={faGlobe} /> Sitio web
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(institution)}
                        className="rounded-xl border border-electric-200 px-3 py-2 text-sm font-semibold text-electric-700 transition-colors hover:bg-electric-50"
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-2" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleInstitution(institution)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                          institution.isActive
                            ? "border-red-200 text-red-700 hover:bg-red-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        <FontAwesomeIcon icon={faPowerOff} className="mr-2" />
                        {institution.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

            {!loading && !error && filteredInstitutions.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row">
                <p className="text-sm text-gray-600">
                  Página {page} de {totalPages} · {filteredInstitutions.length}{" "}
                  {filteredInstitutions.length === 1
                    ? "institución"
                    : "instituciones"}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    className="btn-ghost px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página anterior de instituciones"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    className="btn-ghost px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página siguiente de instituciones"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {isInstitutionModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget)
                  closeInstitutionModal();
              }}
              role="presentation"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="institution-form-title"
                className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-50 text-electric-600">
                      <FontAwesomeIcon icon={faBuildingColumns} />
                    </div>
                    <div>
                      <h2
                        id="institution-form-title"
                        className="font-semibold text-gray-900"
                      >
                        {editingInstitution
                          ? "Editar institución"
                          : "Nueva institución"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {editingInstitution
                          ? "Actualiza su identidad y datos de contacto."
                          : "Registra su identidad y datos de contacto."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeInstitutionModal}
                    disabled={saving}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
                    aria-label="Cerrar formulario"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <form onSubmit={saveInstitution} className="space-y-4 p-6">
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-gray-700"
                      htmlFor="name"
                    >
                      Nombre *
                    </label>
                    <input
                      ref={nameInputRef}
                      id="name"
                      required
                      maxLength={160}
                      className="input-primary"
                      value={form.name}
                      onChange={(event) => setField("name", event.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-gray-700"
                      htmlFor="taxId"
                    >
                      NIT / identificación
                    </label>
                    <input
                      id="taxId"
                      maxLength={40}
                      className="input-primary"
                      value={form.taxId || ""}
                      onChange={(event) =>
                        setField("taxId", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-gray-700"
                      htmlFor="legalName"
                    >
                      Razón social
                    </label>
                    <input
                      id="legalName"
                      maxLength={200}
                      className="input-primary"
                      value={form.legalName || ""}
                      onChange={(event) =>
                        setField("legalName", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-gray-700"
                      htmlFor="contactEmail"
                    >
                      Correo de contacto
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      className="input-primary"
                      value={form.contactEmail || ""}
                      onChange={(event) =>
                        setField("contactEmail", event.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium text-gray-700"
                        htmlFor="phone"
                      >
                        Teléfono
                      </label>
                      <input
                        id="phone"
                        className="input-primary"
                        value={form.phone || ""}
                        onChange={(event) =>
                          setField("phone", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block text-sm font-medium text-gray-700"
                        htmlFor="website"
                      >
                        Sitio web
                      </label>
                      <input
                        id="website"
                        type="url"
                        placeholder="https://"
                        className="input-primary"
                        value={form.website || ""}
                        onChange={(event) =>
                          setField("website", event.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-gray-700"
                      htmlFor="address"
                    >
                      Dirección
                    </label>
                    <input
                      id="address"
                      className="input-primary"
                      value={form.address || ""}
                      onChange={(event) =>
                        setField("address", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-gray-700"
                      htmlFor="city"
                    >
                      Ciudad
                    </label>
                    <input
                      id="city"
                      className="input-primary"
                      value={form.city || ""}
                      onChange={(event) =>
                        setField("city", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-sm font-medium text-gray-700"
                      htmlFor="logoUrl"
                    >
                      URL del logo
                    </label>
                    <input
                      id="logoUrl"
                      type="url"
                      placeholder="https://"
                      className="input-primary"
                      value={form.logoUrl || ""}
                      onChange={(event) =>
                        setField("logoUrl", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeInstitutionModal}
                      disabled={saving}
                      className="btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FontAwesomeIcon
                        icon={editingInstitution ? faPen : faPlus}
                        className="mr-2"
                      />
                      {saving
                        ? editingInstitution
                          ? "Guardando..."
                          : "Creando..."
                        : editingInstitution
                          ? "Guardar cambios"
                          : "Crear institución"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default InstitutionsPage;
