export const queryKeys = {
  tickInfo: () => ["qubic", "tickInfo"] as const,
  lastProcessedTick: () => ["qubic", "lastProcessedTick"] as const,
  balance: (identity: string) => ["qubic", "balance", identity] as const,
  transactions: (identity: string) => ["qubic", "transactions", identity] as const,
  qbiQuery: (contract: string, entry: string, argsKey: string) =>
    ["qubic", "qbi", contract, entry, argsKey] as const,
};
