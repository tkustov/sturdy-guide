import { NoImplError } from '../intrinsic/NoImplError.js';

export class Option<Value> {
  static some<SomeValue>(value: SomeValue): Option<SomeValue> {
    return new Some<SomeValue>(value);
  }

  static none<SomeValue>(): Option<SomeValue> {
    return new None();
  }

  constructor() {
    if (this.constructor === Option) {
      throw new Error('direct instantiating is forbidden');
    }
  }

  isSome(): boolean {
    throw NoImplError.abstractMethod('isSome');
  }

  isNone(): boolean {
    throw NoImplError.abstractMethod('isNone');
  }

  unwrap(): Value {
    throw NoImplError.abstractMethod('unwrap');
  }

  unwrapOrElse<ElseValue>(elseValue: ElseValue): Value | ElseValue {
    throw NoImplError.abstractMethod('unwrapOrElse');
  }

  map<MapValue>(mapFn: (value: Value) => MapValue): Option<MapValue> {
    throw NoImplError.abstractMethod('map');
  }

  mapOrElse<MapValue, ElseValue>(
    mapFn: (value: Value) => MapValue,
    elseValue: ElseValue
  ): MapValue | ElseValue {
    throw NoImplError.abstractMethod('mapOrElse');
  }
}

class Some<Value> extends Option<Value> {
  constructor(private value: Value) {
    super();
    Object.freeze(this);
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  unwrap(): Value {
    return this.value;
  }

  unwrapOrElse<ElseValue>(elseValue: ElseValue): Value | ElseValue {
    return this.value;
  }

  map<MapValue>(mapFn: (value: Value) => MapValue): Option<MapValue> {
    try {
      const mapValue = mapFn(this.value);
      return Option.some(mapValue);
    } catch (error) {
      return Option.none();
    }
  }

  mapOrElse<MapValue, ElseValue>(
    mapFn: (value: Value) => MapValue,
    elseValue: ElseValue
  ): MapValue {
    return this.map(mapFn).unwrap();
  }
}

class None<Value> extends Option<Value> {
  constructor() {
    super();
    Object.freeze(this);
  }

  isSome(): boolean {
    return false;
  }

  isNone(): boolean {
    return true;
  }

  unwrap(): Value {
    throw new Error('Unwrap of Option.None is forbidden')
  }

  unwrapOrElse<ElseValue>(elseValue: ElseValue): Value | ElseValue {
    return elseValue;
  }

  map<MapValue>(mapFn: (value: Value) => MapValue): Option<MapValue> {
    return Option.none();
  }

  mapOrElse<MapValue, ElseValue>(
    mapFn: (value: Value) => MapValue,
    elseValue: ElseValue
  ): MapValue | ElseValue {
    return elseValue;
  }
}
