import type { LastProcessedTick } from "@qubic-labs/sdk";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useSdk } from "../providers/sdk-provider.js";
import { queryKeys } from "../query/keys.js";

export type UseLastProcessedTickOptions = Omit<
  UseQueryOptions<LastProcessedTick, Error>,
  "queryKey" | "queryFn"
>;

export function useLastProcessedTick(options: UseLastProcessedTickOptions = {}) {
  const sdk = useSdk();
  return useQuery({
    ...options,
    queryKey: queryKeys.lastProcessedTick(),
    queryFn: () => sdk.rpc.query.getLastProcessedTick(),
  });
}
