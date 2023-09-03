import { LogLevel } from '@sapphire/framework';
import { Logger } from '@sapphire/plugin-logger';
import type { SeverityLevel } from '@sentry/node';
import { captureMessage } from '@sentry/node';

export class SwanLogger extends Logger {
  public trace(...values: readonly unknown[]): void {
    // Disabled: this.sendLogToSentry(Severity.Log, values);
    this.write(LogLevel.Trace, ...values);
  }

  public debug(...values: readonly unknown[]): void {
    // Disabled: this.sendLogToSentry(Severity.Debug, values);
    this.write(LogLevel.Debug, ...values);
  }

  public info(...values: readonly unknown[]): void {
    this.sendLogToSentry('info', values);
    this.write(LogLevel.Info, ...values);
  }

  public warn(...values: readonly unknown[]): void {
    this.sendLogToSentry('warning', values);
    this.write(LogLevel.Warn, ...values);
  }

  public error(...values: readonly unknown[]): void {
    this.sendLogToSentry('error', values);
    this.write(LogLevel.Error, ...values);
  }

  public fatal(...values: readonly unknown[]): void {
    this.sendLogToSentry('fatal', values);
    this.write(LogLevel.Fatal, ...values);
  }

  public sendLogToSentry(level: SeverityLevel, ...values: readonly unknown[]): void {
    captureMessage(values.join('\n'), level);
  }
}
