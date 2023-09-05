export interface Token<T = string, V = any> {
  index: number;
  length: number;
  type: T;
  value: V;
}

export function token<T = string, V = any>(
  index: number,
  length: number,
  type: T,
  value: V
): Token<T, V> {
  return { index, length, type, value };
}
