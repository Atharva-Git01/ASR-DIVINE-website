import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown>

function timestamp(): string {
  return new Date().toISOString()
}

function formatMessage(level: LogLevel, message: string, ctx?: LogContext): string {
  const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`
  return ctx ? `${base} ${JSON.stringify(ctx)}` : base
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export const logger = {
  debug(message: string, ctx?: LogContext) {
    if (!isProduction()) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('debug', message, ctx))
    }
  },

  info(message: string, ctx?: LogContext) {
    // eslint-disable-next-line no-console
    console.info(formatMessage('info', message, ctx))
  },

  warn(message: string, ctx?: LogContext) {
    // eslint-disable-next-line no-console
    console.warn(formatMessage('warn', message, ctx))
    if (isProduction()) {
      Sentry.captureMessage(message, { level: 'warning', extra: ctx })
    }
  },

  error(message: string, error?: unknown, ctx?: LogContext) {
    // eslint-disable-next-line no-console
    console.error(formatMessage('error', message, ctx), error ?? '')
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { message, ...ctx } })
    } else if (isProduction()) {
      Sentry.captureMessage(message, { level: 'error', extra: { error, ...ctx } })
    }
  },
}
