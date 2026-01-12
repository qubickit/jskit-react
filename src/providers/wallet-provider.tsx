import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type {
  WalletAccount,
  WalletConnector,
  WalletConnectorType,
  WalletConnectResult,
  WalletSession,
  WalletSignTransactionRequest,
  WalletSignTransactionResult,
  WalletStatus,
} from "../wallet/types.js";

export type WalletState = Readonly<{
  status: WalletStatus;
  connectorType?: WalletConnectorType;
  accounts: readonly WalletAccount[];
  pendingUri?: string;
  error?: Error;
}>;

export type WalletProviderProps = Readonly<{
  connectors: readonly WalletConnector[];
  autoConnect?: boolean;
  storageKey?: string;
  children: ReactNode;
}>;

export type WalletContextValue = Readonly<{
  state: WalletState;
  connect(type: WalletConnectorType): Promise<WalletConnectResult | undefined>;
  approveWalletConnect(): Promise<void>;
  disconnect(): Promise<void>;
  requestAccounts(): Promise<readonly WalletAccount[]>;
  signTransaction(input: WalletSignTransactionRequest): Promise<WalletSignTransactionResult>;
}>;

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({
  connectors,
  autoConnect = true,
  storageKey = "qubic.wallet.connector",
  children,
}: WalletProviderProps) {
  const [state, setState] = useState<WalletState>({
    status: "idle",
    accounts: [],
  });
  const pendingApproval = useRef<(() => Promise<readonly WalletAccount[]>) | null>(null);

  const connectorMap = useMemo(() => {
    const map = new Map<WalletConnectorType, WalletConnector>();
    for (const connector of connectors) map.set(connector.type, connector);
    return map;
  }, [connectors]);

  useEffect(() => {
    if (!autoConnect) return;
    const stored = getStorage()?.getItem(storageKey);
    if (!stored) return;
    const connector = connectorMap.get(stored as WalletConnectorType);
    if (!connector || !connector.restore) return;
    connector
      .restore()
      .then((accounts) => {
        if (!accounts) return;
        setState({
          status: "connected",
          connectorType: connector.type,
          accounts,
        });
      })
      .catch((error) => {
        setState({
          status: "error",
          connectorType: connector.type,
          accounts: [],
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });
  }, [autoConnect, connectorMap, storageKey]);

  const connect = async (type: WalletConnectorType) => {
    const connector = connectorMap.get(type);
    if (!connector) {
      throw new Error(`Unknown wallet connector: ${type}`);
    }
    const available = await connector.isAvailable();
    if (!available) throw new Error(`${type} connector is not available`);
    setState((current) => ({
      ...current,
      status: "connecting",
      connectorType: type,
      pendingUri: undefined,
      error: undefined,
    }));
    try {
      const result = await connector.connect();
      if (result.status === "pending") {
        pendingApproval.current = result.approve;
        setState((current) => ({
          ...current,
          status: "connecting",
          pendingUri: result.uri,
        }));
        return result;
      }
      const session: WalletSession = { type, accounts: result.accounts };
      persistConnector(session.type, storageKey);
      setState({
        status: "connected",
        connectorType: session.type,
        accounts: session.accounts,
      });
      return result;
    } catch (error) {
      setState({
        status: "error",
        connectorType: type,
        accounts: [],
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  };

  const approveWalletConnect = async () => {
    if (!pendingApproval.current) return;
    try {
      const accounts = await pendingApproval.current();
      const type = state.connectorType ?? "walletconnect";
      persistConnector(type, storageKey);
      setState({
        status: "connected",
        connectorType: type,
        accounts,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    } finally {
      pendingApproval.current = null;
    }
  };

  const disconnect = async () => {
    if (!state.connectorType) return;
    const connector = connectorMap.get(state.connectorType);
    if (connector) {
      await connector.disconnect();
    }
    pendingApproval.current = null;
    setState({ status: "idle", accounts: [] });
    clearConnector(storageKey);
  };

  const requestAccounts = async () => {
    if (!state.connectorType) throw new Error("No connector selected");
    const connector = connectorMap.get(state.connectorType);
    if (!connector) throw new Error("Connector not available");
    const accounts = await connector.requestAccounts();
    setState((current) => ({ ...current, accounts }));
    return accounts;
  };

  const signTransaction = async (input: WalletSignTransactionRequest) => {
    if (!state.connectorType) throw new Error("No connector selected");
    const connector = connectorMap.get(state.connectorType);
    if (!connector) throw new Error("Connector not available");
    return connector.signTransaction(input);
  };

  const value: WalletContextValue = {
    state,
    connect,
    approveWalletConnect,
    disconnect,
    requestAccounts,
    signTransaction,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used within WalletProvider");
  return value;
}

function getStorage(): Storage | undefined {
  const anyGlobal = globalThis as typeof globalThis & { localStorage?: Storage };
  return anyGlobal.localStorage;
}

function persistConnector(type: WalletConnectorType, storageKey: string) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(storageKey, type);
}

function clearConnector(storageKey: string) {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(storageKey);
}
