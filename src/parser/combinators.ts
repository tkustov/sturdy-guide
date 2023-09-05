import { Either, isLeft, isRight } from 'fp-ts/lib/Either';
import { TailCall, tc } from '../trampoline/Trampoline';
import { ParseResult, consume, raise, shift } from './ParseResult';
import { Parser } from './Parser';
import { Token } from './Token';

export function text(...samples: string[]): Parser {
  const maxLen = samples.reduce((len, sample) => Math.max(len, sample.length), 0);
  return (input, index, cont) => {
    const match = samples.find(sample => input.startsWith(sample, index));
    if (!match) {
      return tc(cont, raise(new Error(`expect any of ${samples.join(', ')}, but got "${input.slice(index, index + maxLen)}"`)));
    }
    return tc(cont, consume({
      index,
      length: match.length,
      type: 'text',
      value: match
    }));
  };
}

export function pattern(regex: RegExp): Parser {
  regex = new RegExp(regex, `${regex.flags}y`);
  return (input, index, cont) => {
    regex.lastIndex = index;
    const match = regex.exec(input);
    if (!match || match[0].length === 0) {
      return tc(cont, raise(new Error(`cannot match ${regex} at ${index}`)));
    }
    return tc(cont, consume({
      index,
      length: match[0].length,
      type: 'pattern',
      value: match
    }));
  };
}

export function opt(parser: Parser): Parser {
  return (input, index, cont) => {
    return tc(parser, input, index, (result) => {
      if (isRight(result)) {
        return tc(cont, result);
      }
      return tc(cont, shift(index));
    });
  };
}

export function repeat(parser: Parser): Parser {
  return (input, index, cont) => {
    const parsed: Token[] = [];
    let parsedTokens = 0;
    let currentIndex = index;

    function parseItem(result: Either<Error, ParseResult>): TailCall<void> {
      if (isRight(result) && result.right.index > currentIndex) {
        const tok = result.right.token;
        if (tok) parsed.push(tok);
        parsedTokens += 1;
        currentIndex = result.right.index;
        return tc(parser, input, currentIndex, parseItem);
      }
      if (parsedTokens > 0) {
        return tc(cont, consume({
          index,
          length: currentIndex - index,
          type: 'repeat',
          value: parsed
        }));
      }
      return tc(cont, isLeft(result) ? result : raise(new Error('cannot parse repeat parser')));
    }

    return tc(parser, input, currentIndex, parseItem);
  };
}

export function alt(...parsers: [Parser, Parser, ...Parser[]]): Parser {
  return (input, index, cont) => {
    let parserNo = 0;
    const messages: string[] = [];

    function eachAlt(result: Either<Error, ParseResult>) {
      if (isRight(result)) {
        return tc(cont, result);
      }
      messages.push(result.left.message);
      parserNo += 1;
      if (parserNo >= parsers.length) {
        return tc(cont, raise(new Error(`cannot parse any alternative:\n${messages.join('\n')}`)));
      }
      return tc(parsers[parserNo], input, index, eachAlt);
    }

    return tc(parsers[parserNo], input, index, eachAlt);
  };
}

export function seq(parsers: [Parser, ...Parser[]], checkEnd?: Parser): Parser {
  return (input, index, cont) => {
    let parserNo = 0;
    let currentIndex = index;
    const tokens: Token[] = [];

    function parseSeq(result: Either<Error, ParseResult>) {
      if (isRight(result)) {
        const tok = result.right.token;
        if (tok) {
          tokens.push(tok);
        }
        currentIndex = result.right.index;
        parserNo += 1;
        if (parserNo >= parsers.length) {
          return tc(cont, consume({
            index,
            length: currentIndex - index,
            type: 'sequence',
            value: tokens
          }));
        }
        return tc(parsers[parserNo], input, currentIndex, parseSeq);
      }
      if (checkEnd) {
        return tc(checkEnd, input, currentIndex, (result) => {
          if (isRight(result)) {
            return tc(cont, consume({
              index,
              length: currentIndex - index,
              type: 'sequence',
              value: tokens
            }));
          }
          return tc(cont, raise(new Error(`cannot parse seq due to: ${result.left.message}`)));
        });
      }
      return tc(cont, raise(new Error(`cannot parse seq due to: ${result.left.message}`)));
    }
    return tc(parsers[parserNo], input, currentIndex, parseSeq);
  };
}

export function produce(getParser: () => Parser, mapRes: (result: Either<Error, ParseResult>) => Either<Error, ParseResult>): Parser {
  return (input, index, cont) => tc(getParser(), input, index, result => tc(cont, mapRes(result)));
}
