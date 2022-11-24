import { Result } from './Result';

describe('Result', () => {
  describe('Base class', () => {
    it('should throw error in case of direct instantiation', () => {
      expect(() => { new Result() }).toThrow(Error);
    });

    it('should return Ok by calling static .ok()', () => {
      const ok = Result.ok(1);
      expect(ok).toBeInstanceOf(Result);
      expect(ok.isOk()).toBe(true);
    });

    it('should return Err by calling static .err()', () => {
      const err = Result.err(1);
      expect(err).toBeInstanceOf(Result);
      expect(err.isErr()).toBe(true);
    });
  });

  describe('Ok', () => {
    it('should be instance of Result', () => {
      const ok = Result.ok(1);
      expect(ok).toBeInstanceOf(Result);
    });

    it('.isOk() should return true', () => {
      const ok = Result.ok(1);
      expect(ok.isOk()).toBe(true);
    });

    it('.isErr() should return false', () => {
      const ok = Result.ok(1);
      expect(ok.isErr()).toBe(false);
    });

    it('should uwrap value', () => {
      const val = {};
      const val2 = {};
      const ok = Result.ok(val);
      expect(ok.unwrap()).toBe(val);
      expect(ok.unwrapOrElse(val2)).toBe(val);
    });

    it('should throw value on .unwrapErr()', () => {
      const val = 'value';
      const ok = Result.ok(val);
      expect(() => { ok.unwrapErr() }).toThrow(val);
    });

    it('should map value', () => {
      const val1 = { a: 1 };
      const ok = Result.ok(val1);
      const mapped = ok.map((v) => ({ ...v, b: 2 }));
      expect(mapped).toBeInstanceOf(Result);
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toEqual({ a: 1, b: 2 });
    });

    it('should map to Err in case of exception', () => {
      const val1 = {};
      const val2 = {};
      const ok = Result.ok(val1);
      const mapped = ok.map(() => { throw val2 });
      expect(mapped).toBeInstanceOf(Result);
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr()).toBeInstanceOf(Result.MappingError);
    });
  });

  describe('Err', () => {
    const errVal = new Error('test error value');

    it('should be instance of Result', () => {
      const err = Result.err(errVal);
      expect(err).toBeInstanceOf(Result);
    });

    it('.isOk() should return false', () => {
      const err = Result.err(errVal);
      expect(err.isOk()).toBe(false);
    });

    it('.isErr() should return true', () => {
      const err = Result.err(errVal);
      expect(err.isErr()).toBe(true);
    });

    it('should throw it\'s value on unwrap', () => {
      const err = Result.err(errVal);
      expect(() => { err.unwrap() }).toThrow(errVal);
    });

    it('should return value on unwrap err', () => {
      const err = Result.err(errVal);
      expect(err.unwrapErr()).toBe(errVal);
    });

    it('should result else value on .unwrapOrElse()', () => {
      const elseVal = {};
      const err = Result.err(errVal);
      expect(err.unwrapOrElse(elseVal)).toBe(elseVal);
    });

    it('should return Err on mapping', () => {
      const err = Result.err(errVal);
      const mapped = err.map(v => v);
      expect(mapped).toBeInstanceOf(Result);
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr()).toBe(errVal);
    });

    it('should return Ok on mapping err', () => {
      const err = Result.err(errVal);
      const mapped = err.mapErr(e => e.message);
      expect(mapped).toBeInstanceOf(Result);
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe(errVal.message);
    });

    it('should return Err on exception during mapping err', () => {
      const err = Result.err<Error, number>(errVal);
      const ex = new Error('text ex');
      const mapped = err.mapErr((e): number => { throw ex });
      expect(mapped).toBeInstanceOf(Result);
      expect(mapped.isErr()).toBe(true);
      const mapErr = mapped.unwrapErr();
      expect(mapErr).toBeInstanceOf(Result.MappingError);
      // @ts-ignore already know exact type
      expect(mapErr.exception).toBe(ex);
    });

    it('should return else\'s value on .mapOrElse()', () => {
      const err = Result.err(errVal);
      const elseVal = {};
      const res = err.mapOrElse((v) => [v], elseVal);
      expect(res).toBe(elseVal);
    });
  });
});
