declare global {
  interface TokenTypeMap {
    'sequence': Token[];
  }
}

export interface Token<Type = string, Value = any> {
  readonly index: number;
  readonly length: number;
  readonly type: Type;
  readonly value: Value;
}

export class Tokens<TypeMap extends TokenTypeMap> {
  create<Type extends keyof TypeMap>(
    { index, length, type, value }: Token<Type, TypeMap[Type]>
  ): Token<Type, TypeMap[Type]> {
    return Object.freeze({
      index,
      length,
      type,
      value
    });
  }
}
