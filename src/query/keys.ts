export const queryKeys = {
  tickInfo: () => ["qubic", "tickInfo"] as const,
  lastProcessedTick: () => ["qubic", "lastProcessedTick"] as const,
  balance: (identity: string) => ["qubic", "balance", identity] as const,
  transactions: (identity: string, paramsKey = "default") =>
    ["qubic", "transactions", identity, paramsKey] as const,
  qbiQuery: (contract: string, entry: string, argsKey: string) =>
    ["qubic", "qbi", contract, entry, argsKey] as const,
};
