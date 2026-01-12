export type WalletConnectorType = "metamask-snap" | "walletconnect";

export type WalletStatus = "idle" | "connecting" | "connected" | "error";

export type WalletAccount = Readonly<{
  address: string;
  alias?: string;
}>;

export type WalletSession = Readonly<{
  type: WalletConnectorType;
  accounts: readonly WalletAccount[];
}>;

export type WalletSignTransactionRequest =
  | Readonly<{
      kind: "snap";
      txBytes: Uint8Array;
      signatureOffset: number;
      accountIndex?: number;
    }>
  | Readonly<{
      kind: "walletconnect";
      from: string;
      to: string;
      amount: number;
      tick?: number;
      inputType?: number;
      payloadBase64?: string | null;
      nonce?: string;
    }>;

export type WalletSignTransactionResult = Readonly<{
  signedTxBase64: string;
  signedTxBytes?: Uint8Array;
}>;

export type WalletConnectResult =
  | Readonly<{ status: "connected"; accounts: readonly WalletAccount[] }>
  | Readonly<{ status: "pending"; uri: string; approve: () => Promise<readonly WalletAccount[]> }>;

export type WalletConnector = Readonly<{
  type: WalletConnectorType;
  isAvailable(): boolean | Promise<boolean>;
  connect(): Promise<WalletConnectResult>;
  disconnect(): Promise<void>;
  requestAccounts(): Promise<readonly WalletAccount[]>;
  signTransaction(input: WalletSignTransactionRequest): Promise<WalletSignTransactionResult>;
  restore?(): Promise<readonly WalletAccount[] | null>;
}>;
