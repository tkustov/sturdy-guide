import { Option } from '../option/Option';
import { Result } from '../result/Result';
import { Token } from './Token';

export type ParserOutput<T = string, V = any> = Result<Option<Token<T, V>>, ParseError>;

export type Parser<T = string, V = any> = (input: string, index: number) => ParserOutput<T, V>;

export class ParseError extends Error {
  static regexNoMatch(regex: RegExp, index: number): ParseError {
    return new ParseError(`"${regex.source}" no match`, index);
  }

  static textNoMatch(texts: string[], index: number): ParseError {
    const prefix = (
      texts.length > 1
        ? `any of ${texts.map(t => `"${t}"`).join(', ')}`
        : `"${texts[0]}" is`
    );
    return new ParseError(`${prefix} not found`, index);
  }

  static altNoMatch(errors: ParseError[], index: number): ParseError {
    const messages: string = errors.map(err => err.message).join('\n  ');
    return new ParseError(`Cannot parse any of alternatives:\n  ${messages}`, index);
  }

  static seqNoMatch(error: ParseError, index: number): ParseError {
    const message = `Cannot match sequence because of: ${error.toString()}`;
    return new ParseError(message, index);
  }

  static from(error: any, index?: number): ParseError {
    if (error instanceof ParseError) return error;
    if (error instanceof Error) {
      return new ParseError(error.toString(), index ?? -1);
    }
    return new ParseError(String(error), index ?? -1);
  }

  constructor(message: string, public index: number) {
    super(`${message} at ${index}`);
    this.name = 'ParseError';
  }
}

export function Some<T extends Token>(token: T): ParserOutput {
  return Result.ok(Option.some(token));
}

export function None(): ParserOutput {
  return Result.ok(Option.none());
}

export function Err(error: ParseError): ParserOutput {
  return Result.err(error);
}
