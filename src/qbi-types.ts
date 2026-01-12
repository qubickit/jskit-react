import type { SendTransactionResult } from "@qubic-labs/sdk";

export type QbiCodec<Input = unknown, Output = unknown> = Readonly<{
  encode(entry: unknown, value: Input): Uint8Array;
  decode(entry: unknown, bytes: Uint8Array): Output;
}>;

export type QbiQueryInput<Input = unknown, Output = unknown> = Readonly<{
  inputBytes?: Uint8Array;
  inputValue?: Input;
  codec?: QbiCodec<Input, Output>;
  expectedOutputSize?: number;
  retries?: number;
  retryDelayMs?: number;
  signal?: AbortSignal;
  allowSizeMismatch?: boolean;
}>;

export type QbiQueryResult<Output = unknown> = Readonly<{
  responseBytes: Uint8Array;
  responseBase64: string;
  decoded?: Output;
}>;

export type QbiProcedureTxInput<Input = unknown> = Readonly<{
  name: string;
  amount?: bigint;
  targetTick?: bigint | number;
  inputBytes?: Uint8Array;
  inputValue?: Input;
  codec?: QbiCodec<Input, unknown>;
  fromSeed?: string;
  fromVault?: string;
}>;

export type QbiContractHandleLike = Readonly<{
  query<Input = unknown, Output = unknown>(
    name: string,
    input: QbiQueryInput<Input, Output>,
  ): Promise<QbiQueryResult<Output>>;
  sendProcedure<Input = unknown>(input: QbiProcedureTxInput<Input>): Promise<SendTransactionResult>;
}>;

export type QbiHelpersLike = Readonly<{
  contract(nameOrIndex: string | number): QbiContractHandleLike;
}>;
