import type { SendAndConfirmInput, SendTransferResult } from "@qubic-labs/sdk";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useSdk } from "../providers/sdk-provider.js";

export type UseSendAndConfirmOptions = Omit<
  UseMutationOptions<SendTransferResult, Error, SendAndConfirmInput>,
  "mutationFn"
>;

export function useSendAndConfirm(options: UseSendAndConfirmOptions = {}) {
  const sdk = useSdk();
  return useMutation({
    ...options,
    mutationFn: (input) => sdk.transfers.sendAndConfirm(input),
  });
}
