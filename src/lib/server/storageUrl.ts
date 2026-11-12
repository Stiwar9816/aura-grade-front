const SUPABASE_STORAGE_HOST = /^[a-z0-9]{20}\.storage\.supabase\.co$/;

/** Signed download URLs may only point at private Supabase Storage (S3 endpoint). */
export function isTrustedStorageUrl(url: URL): boolean {
	return (
		url.protocol === "https:" &&
		SUPABASE_STORAGE_HOST.test(url.hostname) &&
		url.pathname.startsWith("/storage/v1/s3/") &&
		!url.username &&
		!url.password &&
		!url.port
	);
}
