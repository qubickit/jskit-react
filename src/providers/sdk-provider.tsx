import type { SdkConfig } from "@qubic-labs/sdk";
import { createSdk } from "@qubic-labs/sdk";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

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
