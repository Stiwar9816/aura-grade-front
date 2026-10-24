import { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faArrowRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { DocumentPreview } from "./DocumentPreview";
import { type DocumentDetail, versionStates } from "@/lib/courseLibrary";

const iconButton =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:text-electric-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500 disabled:cursor-not-allowed disabled:opacity-50";

type Props = {
  detail: DocumentDetail;
  canManage: boolean;
  busy: boolean;
  downloadUrl: string;
  onReview?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
};
export function VersionReader({
  detail,
  canManage,
  busy,
  downloadUrl,
  onReview,
  onPublish,
  onArchive,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const checkboxId = useId();
  const readable =
    detail.extractionState === "READY" && !!detail.extractedText.trim();
  const draft = detail.status === "DRAFT";
  const needsReview = canManage && draft && !detail.reviewedAt;
  const stateClass =
    detail.status === "PUBLISHED"
      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      : draft
        ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        : "bg-gray-100 text-gray-600";
  return (
    <section
      className="min-w-0 space-y-4"
      aria-label={`Contenido de la versión ${detail.version}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
        <div className="min-w-0 flex-1 basis-48">
          <h4 className="break-words text-sm font-medium text-gray-900 [overflow-wrap:anywhere]">
            {detail.originalName}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-600">Versión {detail.version}</span>
            <span
              className={`rounded-full px-2 py-1 font-medium ${stateClass}`}
            >
              {versionStates[detail.status]}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className={iconButton}
            onClick={() => setPreviewOpen(true)}
            disabled={busy}
            aria-haspopup="dialog"
            aria-label="Previsualizar documento"
            title="Previsualizar documento"
          >
            <FontAwesomeIcon icon={faEye} aria-hidden="true" />
          </button>
          <a
            className={iconButton}
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Descargar original"
            title="Descargar original"
          >
            <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
          </a>
        </div>
      </div>
      {previewOpen && (
        <DocumentPreview
          name={detail.originalName}
          format={detail.format}
          detailUrl={downloadUrl.replace(/\/download$/, "")}
          downloadUrl={downloadUrl}
          onClose={() => setPreviewOpen(false)}
        />
      )}
      {needsReview &&
        (readable ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Verifica el texto antes de publicar. Al confirmar, esta revisión
              se ocultará.
            </p>
            <div
              className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-800"
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
            <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
              <label
                htmlFor={checkboxId}
                className="flex items-start gap-3 text-sm leading-6 text-gray-700"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-electric-500"
                />
                Revisé el original y confirmo que el texto corresponde a esta
                versión.
              </label>
              <button
                type="button"
                className="btn-primary text-sm"
                disabled={!confirmed || busy}
                onClick={onReview}
              >
                Confirmar revisión
              </button>
            </fieldset>
          </div>
        ) : (
          <p
            role="status"
            className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100"
          >
            No se encontró texto legible. Sube una nueva versión con texto
            seleccionable.
          </p>
        ))}
      {canManage && draft && readable && detail.reviewedAt && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-600">Revisión confirmada</p>
          <button
            type="button"
            className="btn-primary text-sm"
            disabled={busy}
            onClick={onPublish}
          >
            Publicar versión
          </button>
        </div>
      )}
      {canManage && detail.status === "PUBLISHED" && onArchive && (
        <button
          type="button"
          className="min-h-11 rounded-lg px-2 text-sm text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-electric-500 disabled:opacity-50"
          disabled={busy}
          onClick={onArchive}
        >
          Retirar publicación
        </button>
      )}
      {canManage && detail.status === "ARCHIVED" && detail.canReopen && (
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-electric-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-electric-500 disabled:opacity-50"
          disabled={busy}
          onClick={onPublish}
        >
          <FontAwesomeIcon icon={faArrowRotateLeft} aria-hidden="true" />
          Reabrir publicación
        </button>
      )}
    </section>
  );
}
