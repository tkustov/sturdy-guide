import { Option } from '../../option/Option';
import { Result } from '../../result/Result';
import { ParseError } from '../Parser';
import { Text } from './Text';

describe('parse/combinators/Text', () => {
  it('should create a function', () => {
    const test = Text('test');
    expect(typeof test).toBe('function');
  });

  it('should return result(option(token))', () => {
    const test = Text('test');
    const res = test('test is the example', 0);
    expect(res).toBeInstanceOf(Result);
    expect(res.unwrap()).toBeInstanceOf(Option);
    const token = res.unwrap().unwrap();
    expect(token).toStrictEqual({
      index: 0,
      length: 4,
      type: 'text',
      value: 'test'
    });
  });

  it('should accept multiple samples', () => {
    const test = Text('test', 'example');
    const input = 'test example';
    const res1 = test(input, 0);
    const res2 = test(input, 5);
    expect(res1.isOk()).toBe(true);
    expect(res1.unwrap().isSome()).toBe(true);
    expect(res1.unwrap().unwrap()).toStrictEqual({
      index: 0,
      length: 4,
      type: 'text',
      value: 'test'
    });
    expect(res2.isOk()).toBe(true);
    expect(res2.unwrap().isSome()).toBe(true);
    expect(res2.unwrap().unwrap()).toStrictEqual({
      index: 5,
      length: 7,
      type: 'text',
      value: 'example'
    });
  });

  it('should fail if no sample present on passed index', () => {
    const test = Text('test');
    const input = 'super test';
    const errRes = test(input, 0);
    const okRes = test(input, 6);
    expect(errRes.isErr()).toBe(true);
    expect(errRes.unwrapErr()).toBeInstanceOf(ParseError);
    expect(errRes.unwrapErr().index).toBe(0);
    expect(okRes.isOk()).toBe(true);
    expect(okRes.unwrap().isSome()).toBe(true);
    expect(okRes.unwrap().unwrap().index).toBe(6);
  });
});
