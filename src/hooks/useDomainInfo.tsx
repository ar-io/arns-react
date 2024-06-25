import { ANT, AoANTWrite, AoArNSNameData } from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import {
  RefetchOptions,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [{ arweaveDataProvider, arioContract: arioProvider }] =
    useGlobalState();
  const [{ wallet }] = useWalletState();

  // TODO: this should be modified or removed
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

    const [
      { Name: name, Ticker: ticker, Owner: owner },
      controllers,
      undernameCount,
      apexRecord,
    ] = await Promise.all([
      antProcess.getInfo(),
      antProcess.getControllers(),
      antProcess
        .getRecords()
        .then(
          (r: Record<string, any>) =>
            Object.keys(r).filter((k) => k !== '@').length,
        ),
      antProcess.getRecord({ undername: '@' }),
    ]);

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
