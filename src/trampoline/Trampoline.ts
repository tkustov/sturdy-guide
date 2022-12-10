const tailCallFlag = Symbol('trampoline:tailCall');

export type TailCall<T> = {
  (): T | TailCall<T>;
  [tailCallFlag]: true;
};

export function tailCall<R, A extends any[]>(
  fn: (...args: A) => R | TailCall<R>,
  ...args: A
): TailCall<R> {
  let call = <TailCall<R>>(() => fn(...args));
  call[tailCallFlag] = true;
  return call;
}

export function trampoline<P extends any[], R>(fn: (...args: P) => R | TailCall<R>): (...args: P) => R {
  return (...args: P) => {
    let current = fn(...args);
    while (isTailCall(current)) {
      current = current();
    }
    return current;
  };
}

function isTailCall<R>(value: unknown): value is TailCall<R> {
  return typeof value === 'function' && (value as TailCall<R>)[tailCallFlag] === true;
}
