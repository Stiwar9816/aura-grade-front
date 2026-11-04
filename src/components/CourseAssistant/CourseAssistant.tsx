import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faXmark,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import Card from "@/components/Common/Card";
import { DocumentPreview } from "@/components/CourseLibrary/DocumentPreview";
import { useLibraryResource } from "@/components/CourseLibrary/useLibraryResource";
import { libraryRequest } from "@/lib/courseLibrary";
import { preparationDate } from "@/lib/coursePreparation";
import type {
  AssistantAnswer,
  Citation,
  SourcesStatus,
  SourceStatus,
  ActivityPage,
  PersonalResult,
} from "@/lib/courseAssistant";
const iconClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-electric-500";
const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "No fue posible completar la consulta.";
export default function CourseAssistant({
  courseId,
  canManage,
}: {
  courseId: string;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <Card className="border border-gray-200 bg-white">
      <section aria-label="Asistente del curso" className="min-w-0 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Asistente del curso
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {canManage
                ? "Prepara los documentos publicados para las consultas de tus estudiantes."
                : "Consulta la guía y los materiales con referencias a sus fuentes."}
            </p>
          </div>
          <button
            type="button"
            className={iconClass}
            aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(!open)}
          >
            <FontAwesomeIcon icon={open ? faXmark : faChevronDown} />
          </button>
        </div>
        {open && (
          <div id={panelId}>
            {canManage ? (
              <SourcePreparation courseId={courseId} />
            ) : (
              <StudentAssistant courseId={courseId} />
            )}
          </div>
        )}
      </section>
    </Card>
  );
}
function SourcePreparation({ courseId }: { courseId: string }) {
  const [revision, setRevision] = useState(0),
    [busy, setBusy] = useState<string | null>(null),
    [error, setError] = useState("");
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const current = useRef<AbortController | null>(null);
  const base = `/api/courses/${courseId}/assistant`;
  const resource = useLibraryResource<SourcesStatus>(
    `${base}/sources`,
    revision,
  );
  useEffect(() => () => current.current?.abort(), []);
  useEffect(() => {
    const change = (event: Event) => {
      if (
        (event as CustomEvent<string>).detail?.startsWith(
          `/api/courses/${courseId}/documents/`,
        )
      )
        setRevision((v) => v + 1);
    };
    window.addEventListener("course-library-changed", change);
    return () => window.removeEventListener("course-library-changed", change);
  }, [courseId]);
  async function prepare(source: SourceStatus) {
    if (current.current) return;
    const controller = new AbortController();
    current.current = controller;
    setBusy(source.versionId);
    setError("");
    setProgress({ done: source.done, total: source.total });
    try {
      for (let batch = 0; batch < 32; batch++) {
        const result = await libraryRequest<{
          done: number;
          total: number;
          complete: boolean;
        }>(`${base}/sources/${source.versionId}/prepare`, {
          method: "POST",
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setProgress(result);
        if (result.complete) break;
        if (batch === 31)
          throw new Error(
            "Quedan fragmentos por preparar. Puedes retomar la preparación.",
          );
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(errorText(e));
    } finally {
      if (!controller.signal.aborted) {
        setBusy(null);
        setProgress(null);
        setRevision((v) => v + 1);
      }
      if (current.current === controller) current.current = null;
    }
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Al publicar una nueva versión, prepárala aquí. Las versiones retiradas
        dejan de consultarse automáticamente.
      </p>
      {resource.loading ? (
        <p role="status">Cargando fuentes…</p>
      ) : resource.error ? (
        <p role="alert" className="text-sm text-red-700">
          {resource.error.message}
        </p>
      ) : (
        resource.data && (
          <>
            {!resource.data.enabled && (
              <p role="status" className="text-sm text-gray-600">
                El asistente todavía no está habilitado.
              </p>
            )}
            {!resource.data.items.length ? (
              <p className="text-sm text-gray-600">
                Publica una guía o material en la biblioteca para comenzar.
              </p>
            ) : (
              <ul className="space-y-2">
                {resource.data.items.map((source) => (
                  <li
                    key={source.versionId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-medium text-gray-900">
                        {source.title} · V{source.version}
                      </p>
                      <p className="text-sm text-gray-600">
                        {source.error ||
                          (busy === source.versionId && progress
                            ? `Preparando ${progress.done} de ${progress.total} fragmentos…`
                            : source.complete
                              ? "Lista para consultar"
                              : source.done
                                ? `Preparación parcial · ${source.done} de ${source.total}`
                                : "Pendiente de preparar")}
                      </p>
                    </div>
                    <button
                      className="btn-secondary"
                      disabled={
                        !!busy ||
                        !!source.error ||
                        source.complete ||
                        !resource.data?.enabled
                      }
                      onClick={() => void prepare(source)}
                    >
                      {source.complete
                        ? "Preparada"
                        : source.done
                          ? "Continuar"
                          : "Preparar"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )
      )}
      {busy && (
        <p role="status" className="text-sm text-gray-600">
          Puedes cerrar este apartado; la preparación guardada se conserva.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
function StudentAssistant({ courseId }: { courseId: string }) {
  const [mode, setMode] = useState<"sources" | "upcoming" | "results">(
    "sources",
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="Tipo de consulta">
        {(
          [
            ["sources", "Documentos"],
            ["upcoming", "Próximas entregas"],
            ["results", "Mis resultados"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            className={mode === value ? "btn-primary" : "btn-secondary"}
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "sources" ? (
        <DocumentQuestion courseId={courseId} />
      ) : (
        <PersonalQueries key={mode} courseId={courseId} mode={mode} />
      )}
    </div>
  );
}
function DocumentQuestion({ courseId }: { courseId: string }) {
  const [question, setQuestion] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null),
    [preview, setPreview] = useState<Citation | null>(null);
  const [asked, setAsked] = useState("");
  const controller = useRef<AbortController | null>(null);
  const inputId = useId();
  useEffect(() => () => controller.current?.abort(), []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    setAnswer(null);
    setPreview(null);
    setAsked(question.trim());
    try {
      const result = await libraryRequest<AssistantAnswer>(
        `/api/courses/${courseId}/assistant/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question.trim() }),
          signal: abort.signal,
        },
      );
      if (!abort.signal.aborted) setAnswer(result);
    } catch (e) {
      if (!abort.signal.aborted) setError(errorText(e));
    } finally {
      if (!abort.signal.aborted) setBusy(false);
      if (controller.current === abort) controller.current = null;
    }
  }
  const sourceUrl = preview
    ? `/api/courses/${courseId}/documents/${preview.documentId}/versions/${preview.versionId}`
    : "";
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-3">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-900"
        >
          Pregunta sobre los documentos del curso
        </label>
        <textarea
          id={inputId}
          rows={3}
          maxLength={1000}
          minLength={3}
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="¿Qué debo presentar en la actividad 3?"
          className="w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 focus:ring-electric-500"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            Uso sujeto al límite diario. Notas y fechas personales: usa los
            botones superiores.
          </p>
          <button
            type="submit"
            className="btn-primary"
            disabled={busy || question.trim().length < 3}
          >
            {busy ? "Consultando…" : "Consultar"}
          </button>
        </div>
      </form>
      {busy && (
        <p role="status" className="text-sm text-gray-600">
          Buscando en las fuentes publicadas…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {answer && (
        <div
          aria-live="polite"
          className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <p className="break-words text-sm font-medium text-gray-900">
            {asked}
          </p>
          <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
            {answer.answer}
          </p>
          {!!answer.citations.length && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Fuentes consultadas
              </p>
              <ul className="space-y-2">
                {answer.citations.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="break-words text-sm text-gray-700">
                      {c.title} · V{c.version} ·{" "}
                      {c.format === "pdf" ? "página" : "fragmento"} {c.page}
                    </span>
                    <button
                      type="button"
                      className={iconClass}
                      title={`Ver ${c.title}`}
                      aria-label={`Ver ${c.title}, ${c.format === "pdf" ? "página" : "fragmento"} ${c.page}`}
                      onClick={() => setPreview(c)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-600">
                Respuesta generada con IA. Verifica los detalles en la fuente
                oficial.
              </p>
            </>
          )}
        </div>
      )}
      {preview && (
        <DocumentPreview
          name={preview.title}
          format={preview.format}
          detailUrl={sourceUrl}
          downloadUrl={`${sourceUrl}/download`}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
function PersonalQueries({
  courseId,
  mode,
}: {
  courseId: string;
  mode: "upcoming" | "results";
}) {
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState<string | null>(null);
  const base = `/api/courses/${courseId}/academic-queries/activities`;
  const list = useLibraryResource<ActivityPage>(
    `${base}?page=${page}&limit=10${mode === "upcoming" ? "&upcoming=true" : ""}`,
    0,
  );
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Datos de tu cuenta consultados directamente en el sistema. Horario de
        Colombia.
      </p>
      {list.loading ? (
        <p role="status">Cargando actividades…</p>
      ) : list.error ? (
        <p role="alert" className="text-sm text-red-700">
          {list.error.message}
        </p>
      ) : (
        list.data && (
          <>
            {!list.data.items.length ? (
              <p className="text-sm text-gray-600">
                {mode === "upcoming"
                  ? "No tienes próximas entregas programadas."
                  : "No hay actividades disponibles para consultar."}
              </p>
            ) : (
              <ul className="space-y-2">
                {list.data.items.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="break-words font-medium text-gray-900">
                          {a.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Entrega: {preparationDate(a.effectiveDueDate)}
                        </p>
                      </div>
                      {mode === "results" && (
                        <button
                          className="btn-secondary"
                          aria-expanded={selected === a.id}
                          onClick={() =>
                            setSelected(selected === a.id ? null : a.id)
                          }
                        >
                          {selected === a.id
                            ? "Cerrar resultado"
                            : "Ver resultado"}
                        </button>
                      )}
                    </div>
                    {selected === a.id && (
                      <ResultDetail url={`${base}/${a.id}/result`} />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {list.data.total > 10 && (
              <div className="flex items-center justify-between gap-2">
                <button
                  className="btn-secondary"
                  disabled={page === 1}
                  onClick={() => {
                    setSelected(null);
                    setPage((p) => p - 1);
                  }}
                >
                  Anterior
                </button>
                <span className="text-sm">Página {page}</span>
                <button
                  className="btn-secondary"
                  disabled={page * 10 >= list.data.total}
                  onClick={() => {
                    setSelected(null);
                    setPage((p) => p + 1);
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
function ResultDetail({ url }: { url: string }) {
  const result = useLibraryResource<PersonalResult>(url, 0);
  if (result.loading)
    return (
      <p role="status" className="mt-3 text-sm">
        Consultando resultado…
      </p>
    );
  if (result.error)
    return (
      <p role="alert" className="mt-3 text-sm text-red-700">
        {result.error.message}
      </p>
    );
  const data = result.data;
  if (!data) return null;
  if (data.state !== "PUBLISHED" || !data.evaluation)
    return (
      <p className="mt-3 text-sm text-gray-600">
        {data.state === "NOT_SUBMITTED"
          ? "No hay una entrega registrada."
          : "La calificación aún no está publicada."}
      </p>
    );
  return (
    <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
      <p className="font-semibold text-gray-900">
        Nota: {data.evaluation.totalScore}
      </p>
      <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
        {data.evaluation.generalFeedback}
      </p>
      <ul className="space-y-2">
        {data.evaluation.criteria.map((c, i) => (
          <li key={c.criterionId || i} className="text-sm text-gray-700">
            <p className="font-medium">
              {c.name} · {c.score} {c.weight != null && `(${c.weight} %)`}
            </p>
            <p className="whitespace-pre-wrap break-words">{c.feedback}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
