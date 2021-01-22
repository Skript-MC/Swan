class ModerationError extends Error {
  details: Map<string, string>;

  constructor(...args: any[]) {
    super(...args);
    this.name = 'ModerationError';
    this.details = new Map();
  }

  public from(error: Error): this {
    this.addDetail('Original', `${error.name}: ${error.message}`);
    if (error.stack) {
      const stack = error.stack.split('\n');
      stack.shift();
      this.stack = stack.join('\n');
    }
    return this;
  }

  public setMessage(message: string): this {
    this.message = message;
    return this;
  }

  public etStack(stack: string): this {
    this.stack = stack;
    return this;
  }

  public addDetail(name: string, value: boolean | string | undefined): this {
    this.details.set(name, value?.toString() ?? 'Unknown');
    return this;
  }
}

export default ModerationError;
