import { LogLevel } from '@sapphire/framework';
import { Logger } from '@sapphire/plugin-logger';
import { captureMessage, Severity } from '@sentry/node';

export default class SwanLogger extends Logger {
  public trace(...values: readonly unknown[]): void {
    // Disabled: this.sendLogToSentry(Severity.Log, values);
    this.write(LogLevel.Trace, ...values);
  }

  public debug(...values: readonly unknown[]): void {
    // Disabled: this.sendLogToSentry(Severity.Debug, values);
    this.write(LogLevel.Debug, ...values);
  }

  public info(...values: readonly unknown[]): void {
    this.sendLogToSentry(Severity.Info, values);
    this.write(LogLevel.Info, ...values);
  }

  public warn(...values: readonly unknown[]): void {
    this.sendLogToSentry(Severity.Warning, values);
    this.write(LogLevel.Warn, ...values);
  }

  public error(...values: readonly unknown[]): void {
    this.sendLogToSentry(Severity.Error, values);
    this.write(LogLevel.Error, ...values);
  }

  public fatal(...values: readonly unknown[]): void {
    this.sendLogToSentry(Severity.Critical, values);
    this.write(LogLevel.Fatal, ...values);
  }

  public sendLogToSentry(level: Severity, ...values: readonly unknown[]): void {
    captureMessage(values.join('\n'), level);
  }
}
