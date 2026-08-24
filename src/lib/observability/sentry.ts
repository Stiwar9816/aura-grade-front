import type { ErrorEvent, Event, Log } from "@sentry/nextjs";

const sensitiveKey =
  /authorization|cookie|password|token|secret|credential|api.?key|otp|document/i;
const sensitiveValuePatterns = [
  /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /\b(password|token|secret|credential|api[_-]?key|otp)\s*[:=]\s*[^\s,;]+/gi,
  /:\/\/[^\s/@:]+:[^\s/@]+@/g,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
];

const redactString = (value: string): string =>
  sensitiveValuePatterns.reduce(
    (sanitized, pattern) => sanitized.replace(pattern, "[Filtered]"),
    value,
  );

const sanitize = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (typeof value === "string") return redactString(value);
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => sanitize(item, seen));

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      sensitiveKey.test(key) ? "[Filtered]" : sanitize(item, seen),
    ]),
  );
};

export const sanitizeSentryEvent = <T extends Event | ErrorEvent>(event: T): T => {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.query_string;
    if (event.request.url) event.request.url = event.request.url.split(/[?#]/, 1)[0];
    if (event.request.headers) {
      event.request.headers = Object.fromEntries(
        Object.entries(event.request.headers).filter(([key]) => !sensitiveKey.test(key)),
      );
    }
  }

  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
  }
  if (event.extra) event.extra = sanitize(event.extra) as typeof event.extra;
  if (event.contexts) event.contexts = sanitize(event.contexts) as typeof event.contexts;
  if (event.message) event.message = redactString(event.message);

  return event;
};

export const sanitizeSentryLog = (log: Log): Log => ({
  ...log,
  message: redactString(String(log.message)) as Log["message"],
  attributes: sanitize(log.attributes) as Log["attributes"],
});

export const parseSampleRate = (value: string | undefined): number => {
  const rate = Number(value ?? 0);
  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : 0;
};
