import type { TransactionsForIdentityRequest, TransactionsForIdentityResponse } from "@qubic-labs/sdk";
import type { UseInfiniteQueryOptions } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSdk } from "../providers/sdk-provider.js";
import { queryKeys } from "../query/keys.js";

export type UseTransactionsInput = Readonly<{
  identity: string | undefined;
  filters?: TransactionsForIdentityRequest["filters"];
  ranges?: TransactionsForIdentityRequest["ranges"];
  pageSize?: bigint | number;
  limit?: bigint | number;
  offset?: bigint | number;
}>;

export type UseTransactionsOptions = Omit<
  UseInfiniteQueryOptions<
    TransactionsForIdentityResponse,
    Error,
    TransactionsForIdentityResponse,
    ReturnType<typeof queryKeys.transactions>,
    bigint
  >,
  "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
>;

export function useTransactions(input: UseTransactionsInput, options: UseTransactionsOptions = {}) {
  const sdk = useSdk();
  const identity = input.identity;
  const enabled = Boolean(identity) && (options.enabled ?? true);
  const startOffset = toBigint(input.offset ?? 0);
  const pageSize = toBigint(input.pageSize ?? 100);
  const limit = input.limit !== undefined ? toBigint(input.limit) : undefined;
  const paramsKey = serializeParams(input);

  return useInfiniteQuery({
    ...options,
    queryKey: queryKeys.transactions(identity ?? "", paramsKey),
    enabled,
    initialPageParam: startOffset,
    queryFn: async ({ pageParam }) => {
      if (!identity) {
        throw new Error("useTransactions requires identity");
      }
      const consumed = pageParam - startOffset;
      const remaining = limit !== undefined ? limit - consumed : undefined;
      const size = remaining !== undefined ? minBigint(pageSize, remaining) : pageSize;
      return sdk.rpc.query.getTransactionsForIdentity({
        identity,
        filters: input.filters,
        ranges: input.ranges,
        pagination: { offset: pageParam, size },
      });
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.transactions.length === 0) return undefined;
      const totalFetched = pages.reduce((acc, page) => acc + BigInt(page.transactions.length), 0n);
      if (limit !== undefined && totalFetched >= limit) return undefined;
      const nextOffset = startOffset + totalFetched;
      if (nextOffset >= lastPage.hits.total) return undefined;
      return nextOffset;
    },
  });
}

function serializeParams(input: UseTransactionsInput): string {
  const payload = {
    identity: input.identity ?? "",
    filters: input.filters ?? null,
    ranges: input.ranges ?? null,
    pageSize: input.pageSize ?? null,
    limit: input.limit ?? null,
    offset: input.offset ?? null,
  };
  return JSON.stringify(payload, (_key, value) => {
    if (typeof value === "bigint") return value.toString();
    return value;
  });
}

function toBigint(value: bigint | number): bigint {
  if (typeof value === "bigint") return value;
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new TypeError("Expected an integer");
  }
  return BigInt(value);
}

function minBigint(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}
