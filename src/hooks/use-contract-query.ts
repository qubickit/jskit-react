import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type {
  QbiContractSchema,
  QbiFunctionInput,
  QbiFunctionOutput,
  QbiQueryInput,
  QbiQueryResult,
} from "../qbi-types.js";
import { queryKeys } from "../query/keys.js";
import { useContract } from "./use-contract.js";

export type UseContractQueryOptions<Output> = Omit<
  UseQueryOptions<QbiQueryResult<Output>, Error>,
  "queryKey" | "queryFn"
> &
  Readonly<{
    inputKey?: string;
  }>;

export function useContractQuery<
  Schema extends QbiContractSchema,
  Name extends keyof NonNullable<Schema["functions"]> & string,
>(
  nameOrIndex: string | number,
  entry: Name,
  input: QbiQueryInput<QbiFunctionInput<Schema, Name>, QbiFunctionOutput<Schema, Name>>,
  options?: UseContractQueryOptions<QbiFunctionOutput<Schema, Name>>,
): UseQueryResult<QbiQueryResult<QbiFunctionOutput<Schema, Name>>, Error>;
export function useContractQuery<Input = unknown, Output = unknown>(
  nameOrIndex: string | number,
  entry: string,
  input: QbiQueryInput<Input, Output>,
  options?: UseContractQueryOptions<Output>,
): UseQueryResult<QbiQueryResult<Output>, Error>;
export function useContractQuery<Input = unknown, Output = unknown>(
  nameOrIndex: string | number,
  entry: string,
  input: QbiQueryInput<Input, Output>,
  options: UseContractQueryOptions<Output> = {},
): UseQueryResult<QbiQueryResult<Output>, Error> {
  const contract = useContract(nameOrIndex);
  const inputKey = options.inputKey ?? defaultInputKey(input);

  return useQuery({
    ...options,
    queryKey: queryKeys.qbiQuery(String(nameOrIndex), entry, inputKey),
    queryFn: () => contract.query(entry, input),
  });
}

function defaultInputKey(input: QbiQueryInput): string {
  if (input.inputBytes) return toBase64(input.inputBytes);
  if (input.inputValue !== undefined) {
    try {
      return JSON.stringify(input.inputValue, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      );
    } catch {
      return "value";
    }
  }
  return "empty";
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
