import { Regex } from './Regex';

describe('parse/combinators/Regex', () => {
  it('should return parse function', () => {
    const parse = Regex(/(test)|(example)/i);
    expect(typeof parse).toBe('function');
    const res = parse('test example', 0);
    const res2 = parse('test example', 1);

    expect(res.isOk()).toBe(true);
    expect(res.unwrap().isSome()).toBe(true);
    const token = res.unwrap().unwrap();
    expect(token.index).toBe(0);
    expect(token.length).toBe(4);
    expect(token.type).toBe('regex');
    expect(Array.isArray(token.value)).toBe(true);
    expect(token.value.length).toBe(3); // whole match + 2 groups
    expect(token.value[0]).toBe('test');
    expect(token.value[1]).toBe('test');
    expect(token.value[2]).toBeFalsy();

    expect(res2.isErr()).toBe(true);
  });

  it('should found match exactly on passed index', () => {
    const parse = Regex(/(test)|(example)/i);
    const resOk1 = parse('test example', 0);
    const resOk2 = parse('test example', 5);
    const resErr = parse('test example', 1);
    expect(resOk1.isOk()).toBe(true);
    expect(resOk2.isOk()).toBe(true);
    expect(resErr.isErr()).toBe(true);
  });
});
