import { ANT, AoANTWrite, AoArNSNameData } from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import {
  buildAntStateQuery,
  buildArNSRecordQuery,
  buildArNSRecordsQuery,
  queryClient,
} from '@src/utils/network';
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
  const [{ arioContract: arioProvider }] = useGlobalState();
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
      ? await queryClient.fetchQuery(
          buildArNSRecordQuery({ domain, arioContract: arioProvider }),
        )
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

    const arnsRecords = await queryClient.fetchQuery(
      buildArNSRecordsQuery({ arioContract: arioProvider }),
    );
    const associatedNames = Object.entries(arnsRecords)
      .filter(([_, r]) => r.processId == processId.toString())
      .map(([d, _]) => d);

    const state = await queryClient.fetchQuery(
      buildAntStateQuery({ processId: processId.toString() }),
    );
    if (!state) throw new Error('State not found for ANT contract');
    const {
      Name: name,
      Ticker: ticker,
      Owner: owner,
      Controllers: controllers,
      Records: records,
    } = state;
    const apexRecord = records['@'];
    const undernameCount = Object.keys(records).filter((k) => k !== '@').length;

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
