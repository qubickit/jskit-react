import type { SendTransactionResult } from "@qubic-labs/sdk";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { QbiProcedureTxInput } from "../qbi-types.js";
import { useContract } from "./use-contract.js";

export type UseContractProcedureOptions = Omit<
  UseMutationOptions<SendTransactionResult, Error, QbiProcedureTxInput>,
  "mutationFn"
>;

export function useContractProcedure(
  nameOrIndex: string | number,
  options: UseContractProcedureOptions = {},
) {
  const contract = useContract(nameOrIndex);
  return useMutation({
    ...options,
    mutationFn: (input) => contract.sendProcedure(input),
  });
}
