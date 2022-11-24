import { Option } from './Option.js';

describe('Option', () => {
  describe('Base class', () => {
    it('should throw error in case of direct instantiation', () => {
      expect(() => { new Option() }).toThrow(Error);
    });

    it('should create Some by static .some()', () => {
      const some = Option.some(1);
      expect(some).toBeInstanceOf(Option);
      expect(some.isSome()).toBe(true);
    });

    it('should create None by static .none()', () => {
      const none = Option.none();
      expect(none).toBeInstanceOf(Option);
      expect(none.isNone()).toBe(true);
    });
  });

  describe('Some', () => {
    it('should be instance of Option', () => {
      const some = Option.some(1);
      expect(some).toBeInstanceOf(Option);
    });

    it('.isSome() should return true', () => {
      const some = Option.some(1);
      expect(some.isSome()).toBe(true);
    });

    it('.isNone() should return false', () => {
      const some = Option.some(1);
      expect(some.isNone()).toBe(false);
    });

    it('should unwrap value', () => {
      const val = {};
      const some = Option.some(val);
      expect(some.unwrap()).toBe(val);
    });

    it('should return value on unwrap w/ fallback', () => {
      const val = {};
      const fallback = {};
      const some = Option.some(val);
      expect(some.unwrapOrElse(fallback)).toBe(val);
    });

    it('should map value', () => {
      const some = Option.some({ a: 1 });
      const mapped = some.map(v => ({ ...v, b: 2 }));
      expect(mapped).toBeInstanceOf(Option);
      expect(mapped.isSome()).toBe(true);
      expect(mapped.unwrap()).toEqual({ a: 1, b: 2 });
    });

    it('should return none if map fn throws exception', () => {
      const some = Option.some({});
      const mapped = some.map((v): any => { throw new Error('text ex'); });
      expect(mapped).toBeInstanceOf(Option);
      expect(mapped.isNone()).toBe(true);
    });

    it('should map value in case of map w/ fallback', () => {
      const some = Option.some({ a: 1 });
      const res = some.mapOrElse(v => ({ ...v, b: 2 }), { c: 3 });
      expect(res).toEqual({ a: 1, b: 2 });
    });
  });

  describe('None', () => {
    it('should be instance of Option', () => {
      const none = Option.none();
      expect(none).toBeInstanceOf(Option);
    });

    it('.isSome() should return false', () => {
      const none = Option.none();
      expect(none.isSome()).toBe(false);
    });

    it('.isNone() should return true', () => {
      const none = Option.none();
      expect(none.isNone()).toBe(true);
    });

    it('should throw during unwrap value', () => {
      const none = Option.none();
      expect(() => none.unwrap()).toThrow(Error);
    });

    it('should return fallback on unwrap w/ fallback', () => {
      const fallback = {};
      const none = Option.none();
      expect(none.unwrapOrElse(fallback)).toBe(fallback);
    });

    it('should return none', () => {
      const none = Option.none<{ a: number }>();
      const mapped = none.map(v => ({ ...v, b: 2 }));
      expect(mapped).toBeInstanceOf(Option);
      expect(mapped.isNone()).toBe(true);
    });

    it('should return none if map fn throws exception', () => {
      const none = Option.none<{}>();
      const mapped = none.map((v): any => { throw new Error('text ex'); });
      expect(mapped).toBeInstanceOf(Option);
      expect(mapped.isNone()).toBe(true);
    });

    it('should return fallback in case of map w/ fallback', () => {
      const none = Option.none<{ a: number }>();
      const res = none.mapOrElse(v => ({ ...v, b: 2 }), { c: 3 });
      expect(res).toEqual({ c: 3 });
    });
  });
});
