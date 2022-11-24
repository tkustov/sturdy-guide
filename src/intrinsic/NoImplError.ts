export class NoImplError extends Error {
  static abstractMethod(method: string) {
    return new NoImplError(`method "${method}" is abstract, see child classes for implementation`);
  }

  private constructor(message: string) {
    super(message);
    this.name = 'NoImplError';
  }
}
