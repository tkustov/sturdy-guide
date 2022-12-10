import { ParseError, Parser, ParseResult } from '../Parser';

export function Alt(...parsers: Parser[]): Parser {
  return (input, index) => {
    const errors: ParseError[] = [];
    for (const parseAlt of parsers) {
      const res = parseAlt(input, index);
      if (res.isOk()) {
        return res;
      } else {
        errors.push(res.unwrapErr());
      }
    }
    return ParseResult.Err(ParseError.altNoMatch(errors, index));
  }
}
