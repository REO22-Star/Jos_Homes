/**
 * Minimal structured (JSON) logging + an error-capture seam.
 *
 * Emitting one JSON object per line makes logs queryable in any aggregator. The
 * `captureError` seam is where a real monitoring provider (e.g. Sentry) is wired
 * at deploy time; stack traces are logged server-side only and NEVER shown to
 * users (acceptance L5).
 */
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogFields {
  [key: string]: unknown;
}

export function log(level: LogLevel, message: string, fields: LogFields = {}): void {
  const entry = { level, message, time: new Date().toISOString(), ...fields };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export function captureError(error: unknown, context: LogFields = {}): void {
  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) };
  log('error', 'Unhandled error', { error: normalized, ...context });
}
