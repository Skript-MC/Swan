import type { ILogger } from '@sapphire/framework';
import { LogLevel } from '@sapphire/framework';
import { captureMessage, Severity } from '@sentry/node';

export default class SwanLogger implements ILogger {
  protected static readonly levels = new Map<LogLevel, LogMethods>([
    [LogLevel.Trace, 'trace'],
    [LogLevel.Debug, 'debug'],
    [LogLevel.Info, 'info'],
    [LogLevel.Warn, 'warn'],
    [LogLevel.Error, 'error'],
    [LogLevel.Fatal, 'error'],
  ]);

  public level: LogLevel;

  constructor(level: LogLevel) {
    this.level = level;
  }

  public has(level: LogLevel): boolean {
    return level >= this.level;
  }

  public trace(...values: readonly unknown[]): void {
    this.write(LogLevel.Trace, ...values);
  }

  public debug(...values: readonly unknown[]): void {
    this.write(LogLevel.Debug, ...values);
  }

  public info(...values: readonly unknown[]): void {
    this.write(LogLevel.Info, ...values);
  }

  public warn(...values: readonly unknown[]): void {
    this.write(LogLevel.Warn, ...values);
  }

  public error(...values: readonly unknown[]): void {
    this.write(LogLevel.Error, ...values);
  }

  public fatal(...values: readonly unknown[]): void {
    this.write(LogLevel.Fatal, ...values);
  }

  public write(level: LogLevel, ...values: readonly unknown[]): void {
    if (!this.has(level))
      return;
    this.sendLogToSentry(level, values);
    const method = SwanLogger.levels.get(level);
    if (typeof method === 'string')
      console[method](`[${method.toUpperCase()}]`, ...values);
  }

  public sendLogToSentry(level: LogLevel, ...values: readonly unknown[]): void {
    captureMessage(values.join('\n'), this._getSeverity(level));
  }

  private _getSeverity(level: LogLevel): Severity {
    switch (level) {
      case LogLevel.Debug:
        return Severity.Debug;
      case LogLevel.Error:
        return Severity.Error;
      case LogLevel.Fatal:
        return Severity.Critical;
      case LogLevel.Warn:
        return Severity.Warning;
      case LogLevel.Info:
        return Severity.Info;
      default:
        return Severity.Log;
    }
  }
}

export type LogMethods = 'debug' | 'error' | 'info' | 'trace' | 'warn';
