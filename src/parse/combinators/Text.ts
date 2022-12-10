import { ParseError, Parser, ParseResult } from '../Parser';

declare global {
  interface TokenTypeMap {
    "text": string;
  }
}

export function Text(...samples: [string, ...string[]]): Parser {
  return (input, index) => {
    const matched = samples.find(sample => input.startsWith(sample, index));
    if (!matched) {
      return ParseResult.Err(ParseError.textNoMatch(samples, index));
    }
    return ParseResult.Some({
      type: 'text',
      index,
      length: matched.length,
      value: matched
    });
  };
}
