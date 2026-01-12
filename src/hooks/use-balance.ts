import type { LiveBalance } from "@qubic-labs/sdk";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useSdk } from "../providers/sdk-provider.js";
import { queryKeys } from "../query/keys.js";

export type UseBalanceOptions = Omit<UseQueryOptions<LiveBalance, Error>, "queryKey" | "queryFn">;

export function useBalance(identity: string | undefined, options: UseBalanceOptions = {}) {
  const sdk = useSdk();
  const enabled = Boolean(identity) && (options.enabled ?? true);

  return useQuery({
    ...options,
    queryKey: identity ? queryKeys.balance(identity) : queryKeys.balance(""),
    enabled,
    queryFn: async () => {
      if (!identity) {
        throw new Error("useBalance requires identity");
      }
      return sdk.rpc.live.balance(identity);
    },
  });
}
