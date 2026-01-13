import { describe, expect, it } from "bun:test";
import TestRenderer, { act } from "react-test-renderer";
import type { WalletConnector } from "../wallet/types.js";
import { useWallet, WalletProvider } from "./wallet-provider.js";

describe("WalletProvider", () => {
  it("connects with a connector and updates state", async () => {
    const connector: WalletConnector = {
      type: "walletconnect",
      isAvailable: () => true,
      connect: async () => ({
        status: "connected",
        accounts: [{ address: "QUBICADDRESS1" }],
      }),
      disconnect: async () => {},
      requestAccounts: async () => [{ address: "QUBICADDRESS1" }],
      signTransaction: async () => ({ signedTxBase64: "" }),
    };

    let api: ReturnType<typeof useWallet> | undefined;

    function Consumer() {
      api = useWallet();
      return null;
    }

    TestRenderer.create(
      <WalletProvider connectors={[connector]}>
        <Consumer />
      </WalletProvider>,
    );

    await act(async () => {
      await api?.connect("walletconnect");
    });

    expect(api?.state.status).toBe("connected");
    expect(api?.state.accounts[0]?.address).toBe("QUBICADDRESS1");
  });
});
