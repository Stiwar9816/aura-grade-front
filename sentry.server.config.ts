import * as Sentry from "@sentry/nextjs";
import {
  parseSampleRate,
  sanitizeSentryEvent,
  sanitizeSentryLog,
} from "./src/lib/observability/sentry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true" && Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  sendDefaultPii: false,
  enableLogs: true,
  tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  beforeSend: sanitizeSentryEvent,
  beforeSendLog: sanitizeSentryLog,
});
