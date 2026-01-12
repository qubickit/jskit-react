import type { SendTransactionResult } from "@qubic-labs/sdk";

export type QbiCodec<Input = unknown, Output = unknown> = Readonly<{
  encode(entry: unknown, value: Input): Uint8Array;
  decode(entry: unknown, bytes: Uint8Array): Output;
}>;

export type QbiContractSchema = Readonly<{
  functions?: Readonly<Record<string, Readonly<{ input: unknown; output: unknown }>>>;
  procedures?: Readonly<Record<string, Readonly<{ input: unknown }>>>;
}>;

export type QbiRegistrySchema = Readonly<Record<string, QbiContractSchema>>;

type SchemaFunctions<S extends QbiContractSchema> = NonNullable<S["functions"]>;
type SchemaProcedures<S extends QbiContractSchema> = NonNullable<S["procedures"]>;

export type QbiFunctionName<S extends QbiContractSchema> = keyof SchemaFunctions<S> & string;
export type QbiProcedureName<S extends QbiContractSchema> = keyof SchemaProcedures<S> & string;

export type QbiFunctionInput<
  S extends QbiContractSchema,
  Name extends string,
> = Name extends keyof SchemaFunctions<S>
  ? SchemaFunctions<S>[Name] extends { input: infer Input }
    ? Input
    : unknown
  : unknown;

export type QbiFunctionOutput<
  S extends QbiContractSchema,
  Name extends string,
> = Name extends keyof SchemaFunctions<S>
  ? SchemaFunctions<S>[Name] extends { output: infer Output }
    ? Output
    : unknown
  : unknown;

export type QbiProcedureInput<
  S extends QbiContractSchema,
  Name extends string,
> = Name extends keyof SchemaProcedures<S>
  ? SchemaProcedures<S>[Name] extends { input: infer Input }
    ? Input
    : unknown
  : unknown;

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
