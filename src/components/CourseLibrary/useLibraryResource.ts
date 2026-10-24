import { useEffect, useState } from "react";
import { libraryRequest } from "@/lib/courseLibrary";

export function useLibraryResource<T>(url: string, revision = 0) {
  const key = `${url}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    data?: T;
    error?: Error;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    libraryRequest<T>(url, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data });
      },
      (error) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error:
              error instanceof Error
                ? error
                : new Error("No se pudo cargar la biblioteca."),
          });
      },
    );
    return () => controller.abort();
  }, [url, key]);
  return result?.key === key
    ? { ...result, loading: false }
    : { loading: true, data: undefined, error: undefined };
}
