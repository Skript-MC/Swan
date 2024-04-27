import { LogLevel } from '@sapphire/framework';
import { Logger } from '@sapphire/plugin-logger';
import type { SeverityLevel } from '@sentry/node';
import { captureMessage } from '@sentry/node';

export class SwanLogger extends Logger {
  public override trace(...values: readonly unknown[]): void {
    // Disabled: this.sendLogToSentry(Severity.Log, values);
    this.write(LogLevel.Trace, ...values);
  }

  public override debug(...values: readonly unknown[]): void {
    // Disabled: this.sendLogToSentry(Severity.Debug, values);
    this.write(LogLevel.Debug, ...values);
  }

  public override info(...values: readonly unknown[]): void {
    this.sendLogToSentry('info', values);
    this.write(LogLevel.Info, ...values);
  }

  public override warn(...values: readonly unknown[]): void {
    this.sendLogToSentry('warning', values);
    this.write(LogLevel.Warn, ...values);
  }

  public override error(...values: readonly unknown[]): void {
    this.sendLogToSentry('error', values);
    this.write(LogLevel.Error, ...values);
  }

  public override fatal(...values: readonly unknown[]): void {
    this.sendLogToSentry('fatal', values);
    this.write(LogLevel.Fatal, ...values);
  }

  public sendLogToSentry(
    level: SeverityLevel,
    ...values: readonly unknown[]
  ): void {
    captureMessage(values.join('\n'), level);
  }
}
