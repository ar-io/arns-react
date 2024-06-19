import { ANT, AoANTWrite, AoArNSNameData } from '@ar.io/sdk';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
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
    associatedNames?: string[];
    processId: ArweaveTransactionID;
    antProcess: AoANTWrite;
    name: string;
    ticker: string;
    owner: string;
    controllers: string[];
    undernameCount?: number;
    apexRecord: {
      transactionId: string;
      ttlSeconds: number;
    };
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
    associatedNames?: string[];
    processId: ArweaveTransactionID;
    antProcess: AoANTWrite;
    name: string;
    ticker: string;
    owner: string;
    controllers: string[];
    undernameCount: number;
    apexRecord: {
      transactionId: string;
      ttlSeconds: number;
    };
  }> {
    if (!domain && !antId) {
      throw new Error('No domain or antId provided');
    }
    const record = domain
      ? await arioProvider.getArNSRecord({ name: domain })
      : undefined;

    if (!antId && !record?.processId) {
      throw new Error('No processId found');
    }
    const processId = antId || new ArweaveTransactionID(record?.processId);
    const signer = wallet?.arconnectSigner;
    if (!signer) {
      throw new Error('No signer found');
    }
    const antProcess = ANT.init({
      processId: processId.toString(),
      signer,
    });

    const associatedNames = Object.keys(
      await arweaveDataProvider.getRecords({
        filters: { processId: [processId] },
      }),
    );

    const [name, ticker, owner, controllers, undernameCount, apexRecord] =
      await Promise.all([
        antProcess.getName(),
        antProcess.getTicker(),
        antProcess.getOwner(),
        antProcess.getControllers(),
        antProcess
          .getRecords()
          .then(
            (r: Record<string, any>) =>
              Object.keys(r).filter((k) => k !== '@').length,
          ),
        antProcess.getRecord({ undername: '@' }),
      ]);

    console.log(name, ticker, owner, controllers, undernameCount, apexRecord);

    if (!apexRecord) {
      throw new Error('No apexRecord found');
    }

    return {
      arnsRecord: record,
      associatedNames,
      processId,
      antProcess,
      name,
      ticker,
      owner,
      controllers,
      undernameCount,
      apexRecord,
    };
  }

  return { data, isLoading, error, refetch };
}
