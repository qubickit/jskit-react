import { createSdk } from "@qubic-labs/sdk";
import { QueryClient } from "@tanstack/react-query";
import { QubicQueryProvider, SdkProvider, useBalance, useTickInfo } from "../src/index.js";

const queryClient = new QueryClient();
const sdk = createSdk({ baseUrl: "https://rpc.qubic.org" });

function BalanceCard({ identity }: { identity: string }) {
  const balance = useBalance(identity, { refetchInterval: 10_000 });
  if (balance.isLoading) return <div>Loading...</div>;
  if (balance.error) return <div>{balance.error.message}</div>;
  return <div>Balance: {balance.data?.balance?.toString()}</div>;
}

function TickCard() {
  const tick = useTickInfo({ refetchInterval: 5_000 });
  return <div>Tick: {tick.data?.tick?.toString()}</div>;
}

export function App() {
  return (
    <SdkProvider sdk={sdk}>
      <QubicQueryProvider client={queryClient}>
        <BalanceCard identity="..." />
        <TickCard />
      </QubicQueryProvider>
    </SdkProvider>
  );
}
