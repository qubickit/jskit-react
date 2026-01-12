import { useSdk } from "../providers/sdk-provider.js";
import type { QbiContractHandleLike, QbiHelpersLike } from "../qbi-types.js";

type SdkWithQbi = Readonly<{ qbi?: QbiHelpersLike }>;

export function useContract(nameOrIndex: string | number): QbiContractHandleLike {
  const sdk = useSdk();
  const qbi = (sdk as SdkWithQbi).qbi;
  if (!qbi) {
    throw new Error("QBI is not configured on the SDK");
  }
  return qbi.contract(nameOrIndex);
}
