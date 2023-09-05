import { Either, left, right } from 'fp-ts/lib/Either';
import { Token } from './Token';

export interface ParseResult {
  token?: Token;
  index: number;
}

export function consume(token: Token): Either<Error, ParseResult> {
  return right({
    token,
    index: token.index + token.length
  });
}

export function shift(index: number): Either<Error, ParseResult> {
  return right({
    index
  });
}

export function raise(err: Error): Either<Error, ParseResult> {
  return left(err);
}
