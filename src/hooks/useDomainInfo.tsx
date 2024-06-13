import { ANT, ANTWritable, AoArNSNameData, ArIO } from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ANTContractJSON } from '@src/types';
import { RefetchOptions, useSuspenseQuery } from '@tanstack/react-query';

export default function useDomainInfo({
  domain,
  antId,
}: {
  domain?: string;
  antId?: ArweaveTransactionID;
}): {
  data: {
    arnsRecord?: AoArNSNameData;
    antState?: ANTContractJSON;
    associatedNames?: string[];
    antProvider: ANTWritable;
    arioProvider?: ArIO;
    processId: ArweaveTransactionID;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: (options?: RefetchOptions) => void;
} {
  const [{ arweaveDataProvider, arioContract: arioProvider }] =
    useGlobalState();
  const [{ wallet }] = useWalletState();
  const { data, isLoading, error, refetch } = useSuspenseQuery({
    queryKey: ['domainInfo', { domain, antId }],
    queryFn: () => getDomainInfo({ domain, antId }).catch((error) => error),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2, // every block
  });

  async function getDomainInfo({
    domain,
    antId,
  }: {
    domain?: string;
    antId?: ArweaveTransactionID;
  }): Promise<{
    arnsRecord?: AoArNSNameData;
    antState?: ANTContractJSON;
    associatedNames?: string[];
    antProvider: ANT;
    arioProvider?: ArIO;
    processId: ArweaveTransactionID;
  }> {
    if (!domain && !antId) {
      throw new Error('No domain or antId provided');
    }
    const signer = wallet?.arconnectSigner;
    const record = domain
      ? await arioProvider.getArNSRecord({ name: domain })
      : undefined;

    let processId = antId || record?.processId;

    const antProvider =
      processId && signer
        ? // TODO: use ar.io/sdk to create ant contract
          ANT.init({
            contractTxId: processId.toString(),
            signer,
          })
        : undefined;

    if (!antProvider || !processId) {
      throw new Error('No processId found');
    }
    // TODO: get cached domain interactions as well.
    processId = new ArweaveTransactionID(processId.toString());

    const associatedNames = Object.keys(
      await arweaveDataProvider.getRecords({
        filters: { processId: [processId] },
      }),
    );
    return {
      arnsRecord: record,
      antState: {} as any,
      associatedNames,
      antProvider,
      arioProvider,
      processId: new ArweaveTransactionID(processId.toString()),
    };
  }

  return { data, isLoading, error, refetch };
}
