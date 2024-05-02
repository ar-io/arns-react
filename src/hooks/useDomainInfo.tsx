import {
  ANT,
  ANTState,
  ArIO,
  ArNSBaseNameData,
  ArNSLeaseData,
  ArconnectSigner,
} from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { DEFAULT_ARWEAVE } from '@src/utils/constants';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function useDomainInfo({
  domain,
  antId,
}: {
  domain?: string;
  antId?: ArweaveTransactionID;
}) {
  const [{ arweaveDataProvider }] = useGlobalState();
  const { data, isLoading, error, refetch } = useSuspenseQuery({
    queryKey: ['domainInfo', { domain, antId }],
    queryFn: () => getDomainInfo({ domain, antId }).catch((error) => error),
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
    antProvider?: ANT;
    arioProvider?: ArIO;
  }> {
    if (!domain && !antId) {
      throw new Error('No domain or antId provided');
    }
    const arioProvider = ArIO.init({
      signer: new ArconnectSigner(window.arweaveWallet, DEFAULT_ARWEAVE as any),
    });
    const record = domain
      ? await arioProvider.getArNSRecord({ domain })
      : undefined;

    const contractTxId = antId || record?.contractTxId;

    const antProvider = contractTxId
      ? ANT.init({
          contractTxId: contractTxId.toString(),
          signer: new ArconnectSigner(
            window.arweaveWallet,
            DEFAULT_ARWEAVE as any,
          ),
        })
      : undefined;

    if (!antProvider) {
      throw new Error('No contractTxId found');
    }

    const antState = await antProvider.getState();
    const associatedNames = Object.keys(
      await arweaveDataProvider.getRecords({
        filters: { contractTxId: [new ArweaveTransactionID(contractTxId)] },
      }),
    );
    return {
      arnsRecord: record as ArNSLeaseData & ArNSBaseNameData,
      antState,
      associatedNames,
      antProvider,
      arioProvider,
    };
  }

  return { data, isLoading, error, refetch };
}
