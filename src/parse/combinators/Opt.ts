import { Parser, ParseResult } from '../Parser';

export function Opt(parser: Parser): Parser {
  return (input, index) => {
    const res = parser(input, index);
    if (res.isOk()) {
      return res;
    }
    return ParseResult.None();
  };
}
