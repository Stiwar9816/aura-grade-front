import { useEffect, useId, useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faDownload,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Card from "@/components/Common/Card";
import { DocumentPreview } from "@/components/CourseLibrary/DocumentPreview";
import { useLibraryResource } from "@/components/CourseLibrary/useLibraryResource";
import { libraryMutation } from "@/lib/courseLibrary";
import {
  type OfficialSource,
  type PreparedActivity,
  type PreparationPage,
  preparationDate,
  preparationStates,
} from "@/lib/coursePreparation";

const iconClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-electric-500 disabled:opacity-50";
export default function CoursePreparation({
  courseId,
  canManage,
}: {
  courseId: string;
  canManage: boolean;
}) {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const base = `/api/courses/${courseId}/documents`;
  const resource = useLibraryResource<PreparationPage>(
    `${base}/preparation?page=${page}&limit=20`,
    revision,
  );
  const refresh = () => setRevision((v) => v + 1);
  useEffect(() => {
    const onChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail?.startsWith(base + "/"))
        setRevision((v) => v + 1);
    };
    window.addEventListener("course-library-changed", onChange);
    return () => {
      window.removeEventListener("course-library-changed", onChange);
    };
  }, [base]);
  return (
    <Card className="border border-gray-200 bg-white">
      <section
        aria-label="Actividades y cronograma"
        className="min-w-0 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Actividades y cronograma
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {canManage
                ? "Vincula las actividades con la guía y el cronograma publicados."
                : "Consulta tus fechas de entrega y sus documentos oficiales."}{" "}
              Horario de Colombia.
            </p>
          </div>
          <button
            type="button"
            className={iconClass}
            onClick={refresh}
            aria-label="Actualizar actividades"
            title="Actualizar actividades"
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
        </div>
        {resource.loading ? (
          <p role="status" className="text-sm text-gray-600">
            Cargando actividades…
          </p>
        ) : resource.error ? (
          <p role="alert" className="text-sm text-red-700">
            {resource.error.message}
          </p>
        ) : (
          resource.data && (
            <>
              {!resource.data.items.length ? (
                <p className="text-sm text-gray-600">
                  No hay actividades programadas en este curso.
                </p>
              ) : (
                <ul className="space-y-3">
                  {resource.data.items.map((activity) => (
                    <li key={activity.id}>
                      <ActivityRow
                        activity={activity}
                        canManage={canManage}
                        sources={resource.data!.sources}
                        base={base}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {resource.data.total > 20 && (
                <div className="flex items-center justify-between text-sm">
                  <button
                    className="btn-secondary"
                    disabled={page === 1}
                    onClick={() => setPage((v) => v - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {page} de {Math.ceil(resource.data.total / 20)}
                  </span>
                  <button
                    className="btn-secondary"
                    disabled={page * 20 >= resource.data.total}
                    onClick={() => setPage((v) => v + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )
        )}
      </section>
    </Card>
  );
}

export function ActivityRow({
  activity,
  canManage,
  sources,
  base,
}: {
  activity: PreparedActivity;
  canManage: boolean;
  sources: OfficialSource[];
  base: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(activity.status !== "CONFIRMED");
  const panelId = useId();
  const extended = activity.effectiveDueDate !== activity.dueDate;
  return (
    <article className="min-w-0 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-medium text-gray-900">
            {activity.title}
            {!activity.isActive && " · Inactiva"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Entrega: {preparationDate(activity.effectiveDueDate)}
            {extended && " · Prórroga personal"}
          </p>
          {extended && (
            <p className="text-xs text-gray-500">
              Fecha general: {preparationDate(activity.dueDate)}
            </p>
          )}
          <p
            className={`mt-2 text-xs font-medium ${activity.status === "CONFIRMED" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-800 dark:text-amber-200"}`}
          >
            {preparationStates[activity.status]}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-electric-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-electric-500"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          {open ? (
            <>
              <FontAwesomeIcon icon={faXmark} />
              Cerrar
            </>
          ) : canManage ? (
            "Revisar"
          ) : (
            "Ver detalle"
          )}
        </button>
      </div>
      {open && (
        <div
          id={panelId}
          className="mt-4 space-y-4 border-t border-gray-200 pt-4"
        >
          <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
            {activity.description}
          </p>
          <details className="text-sm text-gray-700">
            <summary className="cursor-pointer py-2">
              Rúbrica: {activity.rubric.title} · V{activity.rubric.version}
            </summary>
            <ul className="space-y-3 pt-2">
              {activity.rubric.criteria.map((c) => (
                <li key={c.id}>
                  <p className="font-medium">
                    {c.title} · {c.weight}%
                  </p>
                  {c.description && <p>{c.description}</p>}
                  <ul className="mt-1 space-y-1 text-xs">
                    {c.levels.map((l, i) => (
                      <li key={i}>
                        {l.label} ({l.minScore}–{l.maxScore}): {l.description}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </details>
          {activity.status === "CONFIRMED" &&
          activity.guide &&
          activity.schedule ? (
            <>
              <SourceRow source={activity.guide} base={base} />
              <SourceRow source={activity.schedule} base={base} />
              <p className="text-xs text-gray-500">
                Confirmado por el docente el{" "}
                {preparationDate(activity.confirmedAt!)}.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              {activity.status === "NEEDS_REVIEW"
                ? "Cambió la actividad, la rúbrica o la publicación de sus documentos. El docente debe revisar la vinculación."
                : "El docente aún no ha confirmado la correspondencia con los documentos oficiales."}
            </p>
          )}
          {canManage &&
            (editing ? (
              <ConfirmationForm
                activity={activity}
                sources={sources}
                base={base}
              />
            ) : (
              <button
                type="button"
                className="min-h-11 text-sm text-electric-700 underline"
                onClick={() => setEditing(true)}
              >
                Revisar vinculación
              </button>
            ))}
        </div>
      )}
    </article>
  );
}
function SourceRow({ source, base }: { source: OfficialSource; base: string }) {
  const [preview, setPreview] = useState(false);
  const url = `${base}/${source.documentId}/versions/${source.versionId}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 p-3">
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-gray-900">
          {source.title} · V{source.version}
        </p>
        <p className="break-words text-xs text-gray-600">{source.section}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className={iconClass}
          onClick={() => setPreview(true)}
          aria-label={`Ver ${source.title}`}
          title={`Ver ${source.title}`}
        >
          <FontAwesomeIcon icon={faEye} />
        </button>
        <a
          className={iconClass}
          href={`${url}/download`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Descargar ${source.title}`}
          title={`Descargar ${source.title}`}
        >
          <FontAwesomeIcon icon={faDownload} />
        </a>
      </div>
      {preview && (
        <DocumentPreview
          name={source.name}
          format={source.format}
          detailUrl={url}
          downloadUrl={`${url}/download`}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
}
function ConfirmationForm({
  activity,
  sources,
  base,
}: {
  activity: PreparedActivity;
  sources: OfficialSource[];
  base: string;
}) {
  const guide = sources.find((s) => s.kind === "GUIDE");
  const schedule = sources.find((s) => s.kind === "SCHEDULE");
  const [guideSection, setGuideSection] = useState(
    activity.guide?.section || activity.previousSections?.guide || "",
  );
  const [scheduleSection, setScheduleSection] = useState(
    activity.schedule?.section || activity.previousSections?.schedule || "",
  );
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  if (!guide || !schedule)
    return (
      <p
        role="status"
        className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
      >
        Publica una guía y un cronograma en la biblioteca para confirmar esta
        actividad.
      </p>
    );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await libraryMutation(`${base}/preparation/${activity.id}/confirm`, {
        confirmed: checked,
        guideVersionId: guide!.versionId,
        scheduleVersionId: schedule!.versionId,
        guideSection: guideSection.trim(),
        scheduleSection: scheduleSection.trim(),
        activityHash: activity.activityHash,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar.");
      setBusy(false);
      setChecked(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
        <legend className="mb-3 text-sm font-semibold text-gray-900">
          Confirmar correspondencia
        </legend>
        <SourceRow source={guide} base={base} />
        <label htmlFor={`${id}-guide`} className="block text-sm text-gray-700">
          Sección o página de la guía
        </label>
        <input
          id={`${id}-guide`}
          className="input-primary w-full"
          required
          maxLength={300}
          value={guideSection}
          onChange={(e) => {
            setGuideSection(e.target.value);
            setChecked(false);
          }}
          placeholder="Ej.: Unidad 2, actividad 3, página 5"
        />
        <SourceRow source={schedule} base={base} />
        <label
          htmlFor={`${id}-schedule`}
          className="block text-sm text-gray-700"
        >
          Sección o semana del cronograma
        </label>
        <input
          id={`${id}-schedule`}
          className="input-primary w-full"
          required
          maxLength={300}
          value={scheduleSection}
          onChange={(e) => {
            setScheduleSection(e.target.value);
            setChecked(false);
          }}
          placeholder="Ej.: Semana 6, actividad 3"
        />
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          Revisé los documentos y confirmo que las instrucciones, la rúbrica y
          la fecha general coinciden con lo compartido con el curso.
        </label>
        <button
          className="btn-primary text-sm"
          type="submit"
          disabled={
            !checked || !guideSection.trim() || !scheduleSection.trim() || busy
          }
        >
          {busy ? "Guardando…" : "Confirmar coherencia"}
        </button>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
