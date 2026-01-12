import type { SendTransactionResult } from "@qubic-labs/sdk";
import type { UseMutationResult } from "@tanstack/react-query";
import type { QbiContractSchema, QbiProcedureInput, QbiProcedureTxInput } from "../qbi-types.js";
import type { UseContractProcedureOptions } from "./use-contract-procedure.js";
import { useContractProcedure } from "./use-contract-procedure.js";

export type UseContractMutationOptions<Input = unknown> = UseContractProcedureOptions<Input>;

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
  options?: UseContractMutationOptions<Input>,
) {
  return useContractProcedure(nameOrIndex, options);
}
