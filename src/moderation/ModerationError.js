class ModerationError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ModerationError';
    this.details = new Map();
  }

  from(error) {
    this.addDetail('Original', `${error.name}: ${error.message}`);
    const stack = error.stack.split('\n');
    stack.shift();
    this.stack = stack.join('\n');
    return this;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  setStack(stack) {
    this.stack = stack;
    return this;
  }

  addDetail(name, value) {
    this.details.set(name, value);
    return this;
  }
}

export default ModerationError;
