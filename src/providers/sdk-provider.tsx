import type { SdkConfig } from "@qubic-labs/sdk";
import { createSdk } from "@qubic-labs/sdk";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { useContract } from "../hooks/use-contract.js";
import type { UseContractMutationOptions } from "../hooks/use-contract-mutation.js";
import { useContractMutation } from "../hooks/use-contract-mutation.js";
import type { UseContractQueryOptions } from "../hooks/use-contract-query.js";
import { useContractQuery } from "../hooks/use-contract-query.js";
import type {
  QbiContractSchema,
  QbiFunctionInput,
  QbiFunctionName,
  QbiFunctionOutput,
  QbiProcedureInput,
  QbiProcedureName,
  QbiQueryInput,
  QbiRegistrySchema,
} from "../qbi-types.js";

const SdkContext = createContext<ReturnType<typeof createSdk> | null>(null);

export type SdkProviderProps = Readonly<{
  sdk?: ReturnType<typeof createSdk>;
  config?: SdkConfig;
  children: ReactNode;
}>;

export function SdkProvider({ sdk, config, children }: SdkProviderProps) {
  const value = useMemo(() => sdk ?? createSdk(config), [sdk, config]);
  return <SdkContext.Provider value={value}>{children}</SdkContext.Provider>;
}

export function useSdk() {
  const value = useContext(SdkContext);
  if (!value) throw new Error("useSdk must be used within SdkProvider");
  return value;
}

export function createSdkProvider<Registry extends QbiRegistrySchema>() {
  return {
    SdkProvider,
    useSdk,
    useContract: (name: keyof Registry & string) => useContract(name),
    useContractQuery: <
      ContractName extends keyof Registry & string,
      EntryName extends QbiFunctionName<Registry[ContractName]>,
    >(
      name: ContractName,
      entry: EntryName,
      input: QbiQueryInput<
        QbiFunctionInput<Registry[ContractName], EntryName>,
        QbiFunctionOutput<Registry[ContractName], EntryName>
      >,
      options?: UseContractQueryOptions<QbiFunctionOutput<Registry[ContractName], EntryName>>,
    ) =>
      useContractQuery<Registry[ContractName] & QbiContractSchema, EntryName>(
        name,
        entry,
        input,
        options,
      ),
    useContractMutation: <
      ContractName extends keyof Registry & string,
      EntryName extends QbiProcedureName<Registry[ContractName]>,
    >(
      name: ContractName,
      options?: UseContractMutationOptions<QbiProcedureInput<Registry[ContractName], EntryName>>,
    ) => useContractMutation<Registry[ContractName] & QbiContractSchema, EntryName>(name, options),
  } as const;
}
