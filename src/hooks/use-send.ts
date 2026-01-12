import type { BuildSignedTransferInput, SendTransferResult } from "@qubic-labs/sdk";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useSdk } from "../providers/sdk-provider.js";

export type UseSendOptions = Omit<
  UseMutationOptions<SendTransferResult, Error, BuildSignedTransferInput>,
  "mutationFn"
>;

export function useSend(options: UseSendOptions = {}) {
  const sdk = useSdk();
  return useMutation({
    ...options,
    mutationFn: (input) => sdk.transfers.send(input),
  });
}
