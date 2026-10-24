import { type FormEvent, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faRotateRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Card from "@/components/Common/Card";
import SectionHeader from "@/components/Common/SectionHeader";
import { useConfirm } from "@/context/ConfirmContext";
import {
  type CourseDocument,
  type DocumentDetail,
  type DocumentVersion,
  type LibraryPage,
  documentKinds,
  versionStates,
  LibraryError,
  libraryMutation,
  uploadLibraryFile,
} from "@/lib/courseLibrary";
import { useLibraryResource } from "./useLibraryResource";
import { VersionReader } from "./VersionReader";

function ErrorNotice({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
    >
      <p>{error.message}</p>
      <button type="button" className="btn-secondary" onClick={retry}>
        Volver a intentar
      </button>
    </div>
  );
}
function Pagination({
  page,
  total,
  limit,
  onChange,
  label,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
  label: string;
}) {
  if (total <= limit) return null;
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600"
      aria-label={label}
    >
      <button
        className="btn-secondary"
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </button>
      <span>
        Página {page} de {Math.max(1, Math.ceil(total / limit))}
      </span>
      <button
        className="btn-secondary"
        type="button"
        disabled={page * limit >= total}
        onClick={() => onChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}

export default function CourseLibrary({
  courseId,
  canManage,
}: {
  courseId: string;
  canManage: boolean;
}) {
  // The course pages key this component by course and identity so drafts never cross courses.
  const base = `/api/courses/${encodeURIComponent(courseId)}/documents`;
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notice, setNotice] = useState("");
  const resource = useLibraryResource<LibraryPage<CourseDocument>>(
    `${base}?page=${page}&limit=20`,
    revision,
  );
  const refresh = () => {
    setError(null);
    setRevision((value) => value + 1);
  };
  const selected = resource.data?.items.find((item) => item.id === selectedId);
  const formId = useId();
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = String(values.get("title") || "").trim();
    if (!title) {
      setError(new Error("Escribe un título para el documento."));
      return;
    }
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const document = await libraryMutation<CourseDocument>(base, {
        title,
        kind: values.get("kind"),
      });
      setSelectedId(document.id);
      setShowCreate(false);
      setPage(1);
      refresh();
      setNotice("Documento creado. Ahora puedes cargar su primera versión.");
    } catch (error) {
      setError(error as Error);
    } finally {
      setBusy(false);
    }
  }
  const denied =
    error instanceof LibraryError && [401, 403].includes(error.status);
  return (
    <Card className="min-w-0">
      <section
        className="space-y-5"
        aria-label="Biblioteca del curso"
        aria-busy={resource.loading || busy}
      >
        <SectionHeader
          title="Biblioteca del curso"
          description={
            canManage
              ? "Guía, cronograma y materiales oficiales. Revisa cada versión antes de compartirla con tus estudiantes."
              : "Guía, cronograma y materiales publicados por tu docente."
          }
        />
        {notice && (
          <p
            role="status"
            className="text-sm text-electric-700 dark:text-blue-200"
          >
            {notice}
          </p>
        )}
        {error && <ErrorNotice error={error} retry={refresh} />}
        {resource.error ? (
          <ErrorNotice error={resource.error} retry={refresh} />
        ) : resource.loading ? (
          <p role="status" className="py-4 text-sm text-gray-600">
            Cargando biblioteca...
          </p>
        ) : (
          !denied && (
            <>
              {canManage && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreate((value) => !value)}
                  aria-expanded={showCreate}
                  aria-controls={formId}
                >
                  {showCreate ? "Cerrar formulario" : "Nuevo documento"}
                </button>
              )}
              {canManage && showCreate && (
                <form
                  id={formId}
                  onSubmit={create}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <fieldset
                    disabled={busy}
                    className="space-y-4 disabled:opacity-60"
                  >
                    <legend className="mb-3 font-semibold text-gray-900">
                      Registrar documento
                    </legend>
                    <label className="block text-sm font-medium text-gray-700">
                      Título
                      <input
                        name="title"
                        required
                        maxLength={200}
                        className="input-primary mt-1"
                        placeholder="Por ejemplo: Guía de aprendizaje"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo
                      <select
                        name="kind"
                        defaultValue="GUIDE"
                        className="input-primary mt-1"
                      >
                        {Object.entries(documentKinds).map(([kind, label]) => (
                          <option key={kind} value={kind}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="text-sm text-gray-600">
                      El curso tiene una guía y un cronograma. Para
                      actualizarlos, abre el documento existente y carga una
                      nueva versión.
                    </p>
                    <button className="btn-primary" type="submit">
                      {busy ? "Creando..." : "Crear documento"}
                    </button>
                  </fieldset>
                </form>
              )}
              {!resource.data?.items.length ? (
                <p className="rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
                  {canManage
                    ? "Aún no hay documentos. Registra la guía o el cronograma para cargar su primera versión."
                    : "Tu docente todavía no ha publicado documentos para este curso."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                  {resource.data.items.map((document) => (
                    <li key={document.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId((current) =>
                            current === document.id ? null : document.id,
                          );
                          setNotice("");
                        }}
                        aria-pressed={selected?.id === document.id}
                        className={`flex w-full min-w-0 items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-gray-50 ${selected?.id === document.id ? "bg-electric-50 dark:bg-slate-800" : ""}`}
                      >
                        <span className="min-w-0">
                          <span className="block break-words font-semibold text-gray-900">
                            {document.title}
                          </span>
                          <span className="mt-1 block text-xs text-gray-600">
                            {documentKinds[document.kind]}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-medium text-electric-700 dark:text-blue-200">
                          {selected?.id === document.id
                            ? "Cerrar"
                            : "Consultar"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {resource.data && (
                <Pagination
                  page={page}
                  total={resource.data.total}
                  limit={20}
                  onChange={setPage}
                  label="Páginas de documentos"
                />
              )}
              {selected && (
                <DocumentWorkspace
                  key={selected.id}
                  document={selected}
                  base={`${base}/${selected.id}`}
                  canManage={canManage}
                  onChanged={refresh}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </>
          )
        )}
      </section>
    </Card>
  );
}

function DocumentWorkspace({
  document,
  base,
  canManage,
  onChanged,
  onClose,
}: {
  document: CourseDocument;
  base: string;
  canManage: boolean;
  onChanged: () => void;
  onClose: () => void;
}) {
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ file: File; key: string } | null>(
    null,
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const uploadId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notice, setNotice] = useState("");
  const resource = useLibraryResource<LibraryPage<DocumentVersion>>(
    `${base}/versions?page=${page}&limit=10`,
    revision,
  );
  const selected =
    resource.data?.items.find((item) => item.id === selectedId) ||
    resource.data?.items[0];
  const refresh = () => {
    setError(null);
    setRevision((value) => value + 1);
  };
  const denied =
    error instanceof LibraryError && [401, 403, 404].includes(error.status);
  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!upload) return;
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const version = await uploadLibraryFile(
        `${base}/versions`,
        upload.file,
        upload.key,
      );
      setUpload(null);
      setShowUpload(false);
      if (fileInput.current) fileInput.current.value = "";
      setSelectedId(version.id);
      setPage(1);
      refresh();
      setNotice(
        "Archivo guardado como borrador. Revisa su contenido antes de publicarlo.",
      );
    } catch (error) {
      setError(error as Error);
    } finally {
      setBusy(false);
    }
  }
  async function archive() {
    if (
      !(await confirm({
        title: "Retirar publicación",
        message: `Los estudiantes dejarán de consultar ${document.title}. El archivo y su historial se conservarán.`,
        confirmLabel: "Retirar publicación",
        tone: "warning",
      }))
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await libraryMutation(`${base}/archive`);
      onChanged();
    } catch (error) {
      setError(error as Error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="min-w-0 space-y-4 border-t border-gray-200 pt-5"
      aria-label={`Documento: ${document.title}`}
      aria-busy={busy || resource.loading}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="min-w-0 break-words text-base font-semibold text-gray-900">
          {document.title}
        </h3>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Cerrar documento"
          title="Cerrar documento"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-electric-500 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </button>
      </div>
      {error && <ErrorNotice error={error} retry={refresh} />}
      {notice && (
        <p
          role="status"
          className="text-sm text-electric-700 dark:text-blue-200"
        >
          {notice}
        </p>
      )}
      {resource.error ? (
        <ErrorNotice error={resource.error} retry={refresh} />
      ) : resource.loading ? (
        <p role="status" className="text-sm text-gray-600">
          Cargando versiones...
        </p>
      ) : (
        !denied && (
          <fieldset disabled={busy} className="min-w-0 space-y-4">
            {canManage && (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUpload(null);
                    setShowUpload((value) => !value);
                  }}
                  aria-expanded={showUpload}
                  aria-controls={uploadId}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-electric-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-electric-500"
                >
                  <FontAwesomeIcon
                    icon={showUpload ? faXmark : faPlus}
                    aria-hidden="true"
                  />
                  {showUpload ? "Cancelar carga" : "Nueva versión"}
                </button>
                <button
                  type="button"
                  onClick={refresh}
                  aria-label="Actualizar versiones"
                  title="Actualizar versiones"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-electric-500"
                >
                  <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
                </button>
              </div>
            )}
            {canManage && showUpload && (
              <form
                id={uploadId}
                onSubmit={submitUpload}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <fieldset
                  disabled={busy}
                  className="min-w-0 space-y-3 disabled:opacity-60"
                >
                  <legend className="mb-2 font-semibold text-gray-900">
                    Cargar una nueva versión
                  </legend>
                  <p className="text-sm text-gray-600">
                    Incorpora las actividades revisadas en la guía y carga el
                    archivo que compartirás con el curso. PDF o DOCX, máximo 15
                    MB.
                  </p>
                  <label className="block text-sm text-gray-700">
                    Archivo original
                    <input
                      ref={fileInput}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="mt-2 block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-electric-100 file:px-3 file:py-2 file:text-electric-700"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setError(null);
                        setUpload(null);
                        if (!file) return;
                        if (
                          !/\.(pdf|docx)$/i.test(file.name) ||
                          !file.size ||
                          file.size > 15 * 1024 * 1024
                        ) {
                          setError(
                            new Error(
                              "Selecciona un PDF o DOCX de hasta 15 MB.",
                            ),
                          );
                          event.target.value = "";
                          return;
                        }
                        setUpload({ file, key: crypto.randomUUID() });
                      }}
                    />
                  </label>
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={!upload || busy}
                  >
                    {busy ? "Guardando..." : "Subir versión"}
                  </button>
                  {upload && error && (
                    <p className="text-xs text-gray-600">
                      Puedes volver a subir el archivo seleccionado; el
                      reintento conserva la misma clave.
                    </p>
                  )}
                </fieldset>
              </form>
            )}
            {!resource.data?.items.length ? (
              <p className="text-sm text-gray-600">
                {canManage
                  ? "Este documento todavía no tiene versiones. Carga el archivo original para empezar."
                  : "Este documento ya no tiene una publicación disponible."}
              </p>
            ) : (
              <>
                {canManage && resource.data.total > 1 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                      Versión
                      <select
                        value={selected?.id || ""}
                        onChange={(event) => setSelectedId(event.target.value)}
                        className="input-primary w-auto min-w-0 text-sm"
                      >
                        {resource.data.items.map((version) => (
                          <option key={version.id} value={version.id}>
                            V{version.version} · {versionStates[version.status]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Pagination
                      page={page}
                      total={resource.data.total}
                      limit={10}
                      onChange={setPage}
                      label="Páginas de versiones"
                    />
                  </div>
                )}
                {selected && (
                  <VersionWorkspace
                    key={selected.id}
                    base={`${base}/versions/${selected.id}`}
                    canManage={canManage}
                    busy={busy}
                    onBusyChange={setBusy}
                    onChanged={refresh}
                    onArchive={() => void archive()}
                  />
                )}
              </>
            )}
          </fieldset>
        )
      )}
    </section>
  );
}

function VersionWorkspace({
  base,
  canManage,
  busy,
  onBusyChange,
  onChanged,
  onArchive,
}: {
  base: string;
  canManage: boolean;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onChanged: () => void;
  onArchive: () => void;
}) {
  const confirm = useConfirm();
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const resource = useLibraryResource<DocumentDetail>(base, revision);
  const refresh = () => {
    setError(null);
    setRevision((value) => value + 1);
  };
  async function mutate(action: "review" | "publish") {
    if (!resource.data || busy) return;
    if (
      action === "publish" &&
      !(await confirm({
        title:
          resource.data.status === "ARCHIVED"
            ? "Reabrir publicación"
            : "Publicar versión",
        message:
          resource.data.status === "ARCHIVED"
            ? "Esta versión volverá a estar disponible para los estudiantes activos del curso."
            : "Esta versión estará disponible para los estudiantes activos del curso y reemplazará la publicación anterior.",
        confirmLabel:
          resource.data.status === "ARCHIVED"
            ? "Reabrir publicación"
            : "Publicar versión",
        tone: "info",
      }))
    )
      return;
    onBusyChange(true);
    setError(null);
    try {
      await libraryMutation(
        `${base}/${action}`,
        action === "review"
          ? { confirmed: true, contentHash: resource.data.contentHash }
          : undefined,
      );
      onChanged();
    } catch (error) {
      setError(error as Error);
    } finally {
      onBusyChange(false);
    }
  }
  const denied =
    error instanceof LibraryError && [401, 403, 404].includes(error.status);
  return (
    <div className="space-y-4" aria-busy={busy || resource.loading}>
      {error && <ErrorNotice error={error} retry={refresh} />}
      {resource.error ? (
        <ErrorNotice error={resource.error} retry={refresh} />
      ) : resource.loading ? (
        <p role="status" className="text-sm text-gray-600">
          Cargando documento...
        </p>
      ) : (
        resource.data &&
        !denied && (
          <VersionReader
            key={`${resource.data.id}:${resource.data.reviewedAt}`}
            detail={resource.data}
            canManage={canManage}
            busy={busy}
            downloadUrl={`${base}/download`}
            onReview={() => void mutate("review")}
            onPublish={() => void mutate("publish")}
            onArchive={onArchive}
          />
        )
      )}
    </div>
  );
}
