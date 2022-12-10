import { tailCall, TailCall, trampoline } from './Trampoline';

describe('trampoline', () => {
  it('should handle factorial :)', () => {
    function fac(n: number, acc: number = 1): number | TailCall<number> {
      return n === 1 ? acc : tailCall(fac, n - 1, n * acc);
    }
    const trFac = trampoline(fac);
    expect(trFac(5)).toBe(120);
  });

  it('should handle fibonacci', () => {
    let fibs: number[];
    function fib(n: number, sum: number = 0, prev: number = 1): number | TailCall<number> {
      fibs.push(sum);
      return n <= 0 ? sum : tailCall(fib, n - 1, sum + prev, sum);
    }
    const trFib = trampoline(fib);
    fibs = [];
    expect(trFib(2)).toBe(1);
    console.log(fibs.join(' '));
    fibs = [];
    expect(trFib(4)).toBe(3);
    console.log(fibs.join(' '));
    fibs = [];
    expect(trFib(10)).toBe(55);
    console.log(fibs.join(' '));
  });
});
