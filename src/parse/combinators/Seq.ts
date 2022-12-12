import { ParseError, Parser, ParseResult } from '../Parser';
import { Token } from '../Token';

export function Seq(itemParsers: Parser[], checkEnd?: Parser): Parser {
  return (input, index) => {
    try {
      const items: Token[] = [];
      let lastIndex = index;
      for (const parseItem of itemParsers) {
        const res = parseItem(input, lastIndex);
        if (res.isErr()) {
          if (checkEnd && checkEnd(input, lastIndex).isOk()) {
            break;
          }
          throw ParseError.seqNoMatch(res.unwrapErr(), index);
        }
        if (res.unwrap().isSome()) {
          const itemToken = res.unwrap().unwrap();
          lastIndex += itemToken.length;
          items.push(itemToken);
        }
      }
      return ParseResult.Some<Token<'sequence', TokenTypeMap['sequence']>>({
        index,
        length: lastIndex - index,
        type: 'sequence',
        value: items
      });
    } catch (error) {
      return ParseResult.Err(ParseError.from(error));
    }
  };
}
