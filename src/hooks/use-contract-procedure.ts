import type { SendTransactionResult } from "@qubic-labs/sdk";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { QbiContractSchema, QbiProcedureInput, QbiProcedureTxInput } from "../qbi-types.js";
import { useContract } from "./use-contract.js";

export type UseContractProcedureOptions<Input = unknown> = Omit<
  UseMutationOptions<SendTransactionResult, Error, QbiProcedureTxInput<Input>>,
  "mutationFn"
>;

type TypedProcedureInput<
  Schema extends QbiContractSchema,
  Name extends string,
> = QbiProcedureTxInput<QbiProcedureInput<Schema, Name>> & Readonly<{ name: Name }>;

export function useContractProcedure<
  Schema extends QbiContractSchema,
  Name extends keyof NonNullable<Schema["procedures"]> & string,
>(
  nameOrIndex: string | number,
  options?: UseContractProcedureOptions<QbiProcedureInput<Schema, Name>>,
): UseMutationResult<SendTransactionResult, Error, TypedProcedureInput<Schema, Name>>;
export function useContractProcedure<Input = unknown>(
  nameOrIndex: string | number,
  options?: UseContractProcedureOptions<Input>,
): UseMutationResult<SendTransactionResult, Error, QbiProcedureTxInput<Input>>;
export function useContractProcedure<Input = unknown>(
  nameOrIndex: string | number,
  options: UseContractProcedureOptions<Input> = {},
): UseMutationResult<SendTransactionResult, Error, QbiProcedureTxInput<Input>> {
  const contract = useContract(nameOrIndex);
  return useMutation({
    ...options,
    mutationFn: (input) => contract.sendProcedure(input),
  });
}
