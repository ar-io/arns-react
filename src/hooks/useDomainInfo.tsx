import {
  ANT,
  ANTState,
  ANTWritable,
  ArIO,
  ArNSBaseNameData,
  ArNSLeaseData,
} from '@ar.io/sdk/web';
import { ANTContract } from '@src/services/arweave/ANTContract';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ARNS_REGISTRY_ADDRESS } from '@src/utils/constants';
import { RefetchOptions, useSuspenseQuery } from '@tanstack/react-query';

export default function useDomainInfo({
  domain,
  antId,
}: {
  domain?: string;
  antId?: ArweaveTransactionID;
}): {
  data: {
    arnsRecord?: ArNSLeaseData & ArNSBaseNameData;
    antState?: ANTState;
    associatedNames?: string[];
    antProvider: ANTWritable;
    arioProvider?: ArIO;
    contractTxId: ArweaveTransactionID;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: (options?: RefetchOptions) => void;
} {
  const [{ arweaveDataProvider }] = useGlobalState();
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
    arnsRecord?: ArNSLeaseData & ArNSBaseNameData;
    antState?: ANTState;
    associatedNames?: string[];
    antProvider: ANT;
    arioProvider?: ArIO;
    contractTxId: ArweaveTransactionID;
  }> {
    if (!domain && !antId) {
      throw new Error('No domain or antId provided');
    }
    const signer = wallet?.arconnectSigner;
    const arioProvider = ArIO.init({
      contractTxId: ARNS_REGISTRY_ADDRESS.toString(),
    });
    const record = domain
      ? await arioProvider.getArNSRecord({ domain })
      : undefined;

    let contractTxId = antId || record?.contractTxId;

    const antProvider =
      contractTxId && signer
        ? ANT.init({
            contractTxId: contractTxId.toString(),
            signer,
          })
        : undefined;

    if (!antProvider || !contractTxId) {
      throw new Error('No contractTxId found');
    }
    // TODO: get cached domain interactions as well.
    contractTxId = new ArweaveTransactionID(contractTxId.toString());

    const antState = await antProvider.getState();
    const pendingInteractions =
      await arweaveDataProvider.getPendingContractInteractions(contractTxId);
    const antContract = new ANTContract(
      antState,
      contractTxId,
      pendingInteractions,
    );
    console.log('antContract', antContract);
    const associatedNames = Object.keys(
      await arweaveDataProvider.getRecords({
        filters: { contractTxId: [contractTxId] },
      }),
    );
    return {
      arnsRecord: record as ArNSLeaseData & ArNSBaseNameData,
      antState: antContract.state as ANTState,
      associatedNames,
      antProvider,
      arioProvider,
      contractTxId: new ArweaveTransactionID(contractTxId.toString()),
    };
  }

  return { data, isLoading, error, refetch };
}
