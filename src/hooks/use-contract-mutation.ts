import type { SendTransactionResult } from "@qubic-labs/sdk";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { QbiContractSchema, QbiProcedureInput, QbiProcedureTxInput } from "../qbi-types.js";
import { useContract } from "./use-contract.js";

export type UseContractMutationOptions<Input = unknown> = Omit<
  UseMutationOptions<SendTransactionResult, Error, QbiProcedureTxInput<Input>>,
  "mutationFn"
>;

type TypedProcedureInput<
  Schema extends QbiContractSchema,
  Name extends string,
> = QbiProcedureTxInput<QbiProcedureInput<Schema, Name>> & Readonly<{ name: Name }>;

export function useContractMutation<
  Schema extends QbiContractSchema,
  Name extends keyof NonNullable<Schema["procedures"]> & string,
>(
  nameOrIndex: string | number,
  options?: UseContractMutationOptions<QbiProcedureInput<Schema, Name>>,
): UseMutationResult<SendTransactionResult, Error, TypedProcedureInput<Schema, Name>>;
export function useContractMutation<Input = unknown>(
  nameOrIndex: string | number,
  options?: UseContractMutationOptions<Input>,
): UseMutationResult<SendTransactionResult, Error, QbiProcedureTxInput<Input>>;
export function useContractMutation<Input = unknown>(
  nameOrIndex: string | number,
  options: UseContractMutationOptions<Input> = {},
): UseMutationResult<SendTransactionResult, Error, QbiProcedureTxInput<Input>> {
  const contract = useContract(nameOrIndex);
  return useMutation({
    ...options,
    mutationFn: (input) => contract.sendProcedure(input),
  });
}
