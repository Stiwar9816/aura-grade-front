import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { type DocumentDetail, libraryRequest } from "@/lib/courseLibrary";

type Props = {
  name: string;
  format: "pdf" | "docx";
  detailUrl: string;
  downloadUrl: string;
  onClose: () => void;
};

export function DocumentPreview({
  name,
  format,
  detailUrl,
  downloadUrl,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [content, setContent] = useState<{
    pdfUrl?: string;
    text?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    closeButton.current?.focus();
    return () => element?.close();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    async function load() {
      try {
        if (format === "docx") {
          const detail = await libraryRequest<DocumentDetail>(detailUrl, {
            signal: controller.signal,
          });
          if (!controller.signal.aborted)
            setContent({ text: detail.extractedText });
        } else {
          const response = await fetch(`${detailUrl}/preview`, {
            credentials: "same-origin",
            cache: "no-store",
            signal: controller.signal,
          });
          if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(
              body?.message ||
                body?.error ||
                "No se pudo abrir la vista previa.",
            );
          }
          const blob = await response.blob();
          if (controller.signal.aborted) return;
          objectUrl = URL.createObjectURL(blob);
          setContent({ pdfUrl: objectUrl });
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "No se pudo abrir la vista previa.",
          );
      }
    }
    void load();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [detailUrl, format, attempt]);

  function close() {
    dialog.current?.close();
    onClose();
  }

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={onClose}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-0 text-gray-900 shadow-xl backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold">
            Vista previa
          </h2>
          <p className="mt-1 break-all text-sm text-gray-600">{name}</p>
        </div>
        <button
          ref={closeButton}
          type="button"
          onClick={close}
          aria-label="Cerrar vista previa"
          className="btn-secondary inline-flex h-11 w-11 shrink-0 items-center justify-center"
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-48 p-4" aria-busy={!content && !error}>
        {error ? (
          <div role="alert" className="space-y-3 text-sm">
            <p>{error}</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setError("");
                setContent(null);
                setAttempt((value) => value + 1);
              }}
            >
              Volver a intentar
            </button>
          </div>
        ) : !content ? (
          <p role="status" className="text-sm text-gray-600">
            Cargando vista previa...
          </p>
        ) : content.pdfUrl ? (
          <iframe
            title={`Vista previa de ${name}`}
            src={content.pdfUrl}
            className="h-[65dvh] min-h-72 w-full rounded-lg border border-gray-200 bg-gray-50"
          />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Vista del texto del DOCX. Descarga el original para ver su
              formato, tablas e imágenes.
            </p>
            <div
              tabIndex={0}
              aria-label="Vista previa del texto"
              className="max-h-[60dvh] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-7 [overflow-wrap:anywhere]"
            >
              {content.text ||
                "Este documento no contiene texto legible para previsualizar."}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-4">
        <p className="text-xs text-gray-600">
          Si el visor no muestra el documento, descarga el original.
        </p>
        <a
          className="btn-secondary text-sm"
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Descargar original
        </a>
      </div>
    </dialog>,
    document.body,
  );
}
