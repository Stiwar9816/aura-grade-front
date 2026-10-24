import { useId, useState } from "react";
import { type DocumentDetail, versionStates } from "@/lib/courseLibrary";

type Props = {
  detail: DocumentDetail;
  canManage: boolean;
  busy: boolean;
  downloadUrl: string;
  onReview?: () => void;
  onPublish?: () => void;
};
export function VersionReader({
  detail,
  canManage,
  busy,
  downloadUrl,
  onReview,
  onPublish,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const checkboxId = useId();
  const readable =
    detail.extractionState === "READY" && !!detail.extractedText.trim();
  const draft = detail.status === "DRAFT";
  return (
    <section
      className="min-w-0 space-y-4"
      aria-label={`Contenido de la versión ${detail.version}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900">
            Versión {detail.version} · {versionStates[detail.status]}
          </h4>
          <p className="mt-1 break-all text-sm text-gray-600">
            {detail.originalName}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {detail.format.toUpperCase()} ·{" "}
            {(detail.sizeBytes / 1024 / 1024).toFixed(2)} MB
            {draft && detail.reviewedAt ? " · Revisión confirmada" : ""}
          </p>
        </div>
        <a
          className="btn-secondary text-sm"
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Descargar original
        </a>
      </div>
      {readable ? (
        <>
          <p className="text-sm text-gray-600">
            {canManage
              ? "Compara el texto extraído con el archivo original antes de confirmar la revisión."
              : "Consulta el documento oficial publicado por tu docente."}
          </p>
          <div
            className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-800"
            tabIndex={0}
            aria-label="Texto del documento"
          >
            {detail.pages.length ? (
              detail.pages.map((page) => (
                <section key={page.page} className="mb-5 last:mb-0">
                  <h5 className="mb-2 font-semibold text-gray-600">
                    Página {page.page}
                  </h5>
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {page.text}
                  </p>
                </section>
              ))
            ) : (
              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {detail.extractedText}
              </p>
            )}
          </div>
        </>
      ) : (
        <p
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          No se encontró texto legible. Sube una nueva versión con texto
          seleccionable para revisarla y publicarla.
        </p>
      )}
      {canManage && draft && readable && (
        <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
          {!detail.reviewedAt ? (
            <>
              <div className="flex items-start gap-3">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-electric-500"
                />
                <label
                  htmlFor={checkboxId}
                  className="text-sm leading-6 text-gray-700"
                >
                  Revisé el original y confirmo que el texto extraído
                  corresponde a esta versión.
                </label>
              </div>
              <button
                type="button"
                className="btn-primary"
                disabled={!confirmed || busy}
                onClick={onReview}
              >
                Confirmar revisión
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                La revisión está confirmada. Publica cuando el documento esté
                listo para tus estudiantes.
              </p>
              <button type="button" className="btn-primary" onClick={onPublish}>
                Publicar versión
              </button>
            </div>
          )}
        </fieldset>
      )}
      {canManage && detail.status === "ARCHIVED" && (
        <p className="text-sm text-gray-600">
          Esta versión forma parte del historial. Para volver a utilizarla,
          súbela como una nueva versión.
        </p>
      )}
    </section>
  );
}
