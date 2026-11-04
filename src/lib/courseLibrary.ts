export type DocumentKind = "GUIDE" | "SCHEDULE" | "MATERIAL";
export type CourseDocument = {
  id: string;
  courseId: string;
  title: string;
  kind: DocumentKind;
  createdAt: string;
};
export type DocumentVersion = {
  id: string;
  documentId: string;
  version: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  originalName: string;
  format: "pdf" | "docx";
  sizeBytes: number;
  contentHash: string;
  extractionState: "READY" | "NEEDS_TEXT";
  reviewedAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
};
export type DocumentDetail = DocumentVersion & {
  canReopen: boolean;
  extractedText: string;
  pages: { page: number; text: string }[];
};
export type LibraryPage<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
export const documentKinds: Record<DocumentKind, string> = {
  GUIDE: "Guía del curso",
  SCHEDULE: "Cronograma",
  MATERIAL: "Material de apoyo",
};
export const versionStates = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  ARCHIVED: "Archivada",
};

export class LibraryError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function libraryRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || data?.error;
    throw new LibraryError(
      Array.isArray(message)
        ? message.join(" ")
        : typeof message === "string"
          ? message
          : "No se pudo completar la solicitud. Intenta nuevamente.",
      response.status,
    );
  }
  if (data === null)
    throw new LibraryError(
      "La biblioteca devolvió una respuesta inválida.",
      502,
    );
  return data as T;
}
export function uploadLibraryFile(url: string, file: File, key: string) {
  const body = new FormData();
  body.append("file", file);
  return libraryRequest<DocumentVersion>(url, {
    method: "POST",
    headers: { "Idempotency-Key": key },
    body,
  });
}
export async function libraryMutation<T>(url: string, body?: unknown) {
  const result = await libraryRequest<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("course-library-changed", { detail: url }),
    );
  return result;
}
