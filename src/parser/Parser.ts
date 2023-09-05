import { Either } from 'fp-ts/lib/Either';
import { ParseResult } from './ParseResult';
import { TailCall } from '../trampoline/Trampoline';

export interface ParserCont {
  (res: Either<Error, ParseResult>): void | TailCall<void>;
}

export interface Parser {
  (
    input: string,
    index: number,
    cont: ParserCont
  ): TailCall<void>;
}
