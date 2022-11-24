class NoImplError extends Error {
  constructor() {
    super('there is no implementation');
  }
}

class MappingError extends Error {
  constructor(public exception?: any) {
    super('error occured during mapping');
  }
}

export class Result<OkValue, ErrValue> {
  public static MappingError = MappingError;

  public static ok<OkValue, ErrValue>(value: OkValue): Result<OkValue, ErrValue> {
    return new Ok<OkValue, ErrValue>(value);
  }

  public static err<ErrValue, OkValue = any>(error: ErrValue): Result<OkValue, ErrValue> {
    return new Err<ErrValue, OkValue>(error);
  }

  constructor() {
    if (this.constructor === Result) {
      throw new NoImplError();
    }
  }

  isOk(): boolean {
    throw new NoImplError();
  }

  isErr(): boolean {
    throw new NoImplError();
  }

  unwrap(): OkValue {
    throw new NoImplError();
  }

  unwrapErr(): ErrValue {
    throw new NoImplError();
  }

  unwrapOrElse<ElseValue>(elseValue: ElseValue): OkValue | ElseValue {
    throw new NoImplError();
  }

  map<MapValue>(mapFn: (value: OkValue) => MapValue): Result<MapValue, ErrValue | MappingError> {
    throw new NoImplError();
  }

  mapErr<MapValue>(mapFn: (value: ErrValue) => MapValue): Result<MapValue, OkValue | MappingError> {
    throw new NoImplError();
  }

  mapOrElse<MapValue, ElseValue>(
    mapFn: (value: OkValue) => MapValue,
    elseValue: ElseValue
  ): MapValue | ElseValue {
    throw new NoImplError();
  }
}

class Ok<OkValue, ErrValue = any> extends Result<OkValue, ErrValue> {
  constructor(
    private value: OkValue
  ) {
    super();
    Object.freeze(this);
  }

  isOk(): boolean {
    return true;
  }

  isErr(): boolean {
    return false;
  }

  unwrap(): OkValue {
    return this.value;
  }

  unwrapErr(): ErrValue {
    throw this.value;
  }

  unwrapOrElse<ElseValue>(elseValue: ElseValue): OkValue | ElseValue {
    return this.value;
  }

  map<MapValue>(mapFn: (value: OkValue) => MapValue): Result<MapValue, ErrValue | MappingError> {
    try {
      const mapValue = mapFn(this.value);
      return Result.ok<MapValue, ErrValue>(mapValue);
    } catch (error: any) {
      const mappingError = new MappingError(error);
      return Result.err<MappingError, MapValue>(mappingError);
    }
  }

  mapErr<MapValue>(mapFn: (value: ErrValue) => MapValue): Result<MapValue, OkValue> {
    return Result.err<OkValue, MapValue>(this.value);
  }

  mapOrElse<MapValue, ElseValue>(mapFn: (value: OkValue) => MapValue, elseValue: ElseValue): MapValue | ElseValue {
    try {
      const mapValue = mapFn(this.value);
      return mapValue;
    } catch (error) {
      return elseValue;
    }
  }
}

class Err<ErrValue, OkValue = any> extends Result<OkValue, ErrValue> {
  constructor(
    private error: ErrValue
  ) {
    super();
    Object.freeze(this);
  }

  isOk(): boolean {
    return false;
  }

  isErr(): boolean {
    return true;
  }

  unwrap(): OkValue {
    throw this.error;
  }

  unwrapErr(): ErrValue {
    return this.error;
  }

  unwrapOrElse<ElseValue>(elseValue: ElseValue): OkValue | ElseValue {
    return elseValue;
  }

  map<MapValue>(mapFn: (value: OkValue) => MapValue): Result<MapValue, ErrValue | MappingError> {
    return Result.err<ErrValue, MapValue>(this.error);
  }

  mapErr<MapValue>(mapFn: (value: ErrValue) => MapValue): Result<MapValue, MappingError> {
    try {
      const mapValue = mapFn(this.error);
      return Result.ok<MapValue, MappingError>(mapValue);
    } catch (error) {
      const mappingError = new MappingError(error);
      return Result.err<MappingError, MapValue>(mappingError);
    }
  }

  mapOrElse<MapValue, ElseValue>(mapFn: (value: OkValue) => MapValue, elseValue: ElseValue): MapValue | ElseValue {
    return elseValue;
  }
}
