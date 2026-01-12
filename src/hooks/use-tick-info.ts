import type { TickInfo } from "@qubic-labs/sdk";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useSdk } from "../providers/sdk-provider.js";
import { queryKeys } from "../query/keys.js";

export type UseTickInfoOptions = Omit<UseQueryOptions<TickInfo, Error>, "queryKey" | "queryFn">;

export function useTickInfo(options: UseTickInfoOptions = {}) {
  const sdk = useSdk();
  return useQuery({
    ...options,
    queryKey: queryKeys.tickInfo(),
    queryFn: () => sdk.rpc.live.tickInfo(),
  });
}
