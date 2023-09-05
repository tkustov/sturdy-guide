import { isLeft, isRight, map } from 'fp-ts/lib/Either';
import { trampoline } from '../trampoline/Trampoline';
import { ParseResult } from './ParseResult';
import { Parser } from './Parser';
import { Token, token } from './Token';
import { alt, opt, pattern, produce, repeat, seq, text } from './combinators';

let print = false;

const grammar: Record<string, Parser> = {
  simpleString: produce(
    () => alt(
      seq([
        text('"'),
        repeat(pattern(/\\.|[^"\\]+/)),
        text('"')
      ]),
      seq([
        text('\''),
        repeat(pattern(/\\.|[^'\\]+/)),
        text('\'')
      ])
    ),
    result => map<ParseResult, ParseResult>(result => {
      const [, strTokens,] = result.token!.value;
      return {
        ...result,
        token: token(result.token!.index, result.token!.length, 'string',
          strTokens.value
            .map((tok: Token<'pattern', RegExpMatchArray>) => {
              const s = tok.value[0];
              return s.startsWith('\\') ? s.slice(1) : s;
            })
            .join('')
        )
      }
    })(result)
  ),

  number: produce(() => pattern(/[+-]?(?:\d*\.\d+|\d+)/), result => {
    return map<ParseResult, ParseResult>(res => ({
      index: res.index,
      token: token(res.token!.index, res.token!.length, 'number', parseFloat(res.token!.value[0]))
    }))(result);
  }),

  literal: produce(() => alt(grammar.simpleString, grammar.number), result => result),

  ws: produce(() => opt(pattern(/\s*/)), result => map<ParseResult, ParseResult>(result => ({
    index: result.index,
    token: undefined
  }))(result)),

  muldiv: produce(
    () => seq([
      grammar.number,
      opt(repeat(seq([
        grammar.ws, text('*', '/'), grammar.ws,
        grammar.number
      ])))
    ]),
    res => map<ParseResult, ParseResult>(res => {
      type MulDiv = Token<
        'sequence',
        [Token<'number', number>, Token<'repeat', OpRhs[]> | undefined]
      >;
      type OpRhs = Token<
        'sequence',
        [Token<'text', string>, Token<'number', number>]
      >;
      if (print) {
        console.log('muldiv', JSON.stringify(res));
      }
      // @ts-ignore
      const muldiv: MulDiv = res.token!;
      const opRhs = muldiv.value[1];
      if (!opRhs) {
        return {
          index: res.index,
          token: muldiv.value[0]
        };
      }
      const tokens: Token[] = [
        muldiv.value[0],
        ...opRhs.value.flatMap(opRhs => opRhs.value)
      ];
      let lhs: Token | undefined;
      let o: Token, r: Token;
      let i = 0;
      while (i < tokens.length) {
        if (!lhs) {
          o = tokens[i + 1];
          r = tokens[i + 2];
          lhs = token(tokens[i].index, r.index + r.length, 'muldiv', {
            lhs: tokens[i],
            op: o.value,
            rhs: r
          });
          i += 3;
          continue;
        }
        o = tokens[i];
        r = tokens[i + 1];
        lhs = token(lhs.index, r.index + r.length, 'muldiv', {
          lhs,
          op: o.value,
          rhs: r
        });
        i += 2;
      }
      return {
        index: res.index,
        token: lhs
      };
    })(res)
  ),

  addsub: produce(
    () => alt(
      seq([
        grammar.muldiv,
        grammar.ws, text('+', '-'), grammar.ws,
        grammar.addsub
      ]),
      grammar.muldiv
    ),
    result => map<ParseResult, ParseResult>(result => {
      if (result.token!.type !== 'sequence') return result;
      const [lhs, op, rhs] = result.token!.value;
      return {
        index: result.index,
        token: token(result.token!.index, result.token!.length, 'addsub', {
          lhs,
          op: op.value,
          rhs
        })
      };
    })(result)
  )
};

describe('parser/combinators', () => {
  it('should parse number', (cb) => {
    const parse = trampoline(grammar.number);
    parse('42.42', 0, (res) => {
      expect(isRight(res)).toBe(true);
      expect(isRight(res) ? res.right : undefined).toEqual({
        index: 5,
        token: token(0, 5, 'number', 42.42)
      })
      cb();
    });
  });

  it('should parse alt: first', (cb) => {
    const parse = trampoline(grammar.simpleString);
    parse('"myS\\"tring"', 0, res => {
      if (isLeft(res)) {
        cb(res.left);
        return;
      }
      expect(res.right.index).toBe(12);
      expect(res.right.token).toEqual(token(0, 12, 'string', 'myS"tring'));
      cb();
    });
  });

  it('should parse alt: second', (cb) => {
    const parse = trampoline(grammar.literal);
    parse('100500', 0, res => {
      if (isLeft(res)) {
        cb(res.left);
        return;
      }
      expect(res.right.index).toBe(6);
      expect(res.right.token).toEqual(token(0, 6, 'number', 100500));
      cb();
    });
  });

  it('should parse infix operations', (cb) => {
    const parse = trampoline(grammar.addsub);
    parse('42 + -15 - 80', 0, (res) => {
      expect(isRight(res)).toBe(true);
      if (isLeft(res)) {
        cb(res.left);
        return;
      }
      expect(res.right).toEqual({
        index: 13,
        token: token(0, 13, 'addsub', {
          lhs: token(0, 2, 'number', 42),
          op: '+',
          rhs: token(5, 8, 'addsub', {
            lhs: token(5, 3, 'number', -15),
            op: '-',
            rhs: token(11, 2, 'number', 80)
          })
        })
      });
      cb();
    })
  });

  it('should handle bin op precedece', (cb) => {
    const parse = trampoline(grammar.addsub);
    parse('25 + 16 / 8 * 7 - 10', 0, res => {
      if (isLeft(res)) {
        cb(res.left);
        return;
      }
      console.log(JSON.stringify(res.right.token));
      expect(res.right).toEqual({
        index: 20,
        token: token(0, 20, 'addsub', {
          lhs: token(0, 2, 'number', 25),
          op: '+',
          rhs: token(5, 15, 'addsub', {
            lhs: token(5, 15, 'muldiv', {
              lhs: token(5, 11, 'muldiv', {
                lhs: token(5, 2, 'number', 16),
                op: '/',
                rhs: token(10, 1, 'number', 8)
              }),
              op: '*',
              rhs: token(14, 1, 'number', 7)
            }),
            op: '-',
            rhs: token(18, 2, 'number', 10)
          })
        })
      });
      cb();
    });
  });
});
