import { ParseError, Parser, ParseResult } from '../Parser';

declare global {
  interface TokenTypeMap {
    "regex": RegExpExecArray;
  }
}

export function Regex(srcRegex: RegExp): Parser {
  const normalized = new RegExp(srcRegex, `${srcRegex.flags}y`);
  return (input, index) => {
    normalized.lastIndex = index;
    const match = normalized.exec(input);
    if (!match) {
      return ParseResult.Err(ParseError.regexNoMatch(normalized, index));
    }
    return ParseResult.Some({
      type: 'regex',
      index,
      length: match[0].length,
      value: match
    });
  };
}
