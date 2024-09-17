import {
  ANT,
  AoANTRead,
  AoANTRecord,
  AoANTWrite,
  AoArNSNameData,
} from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { lowerCaseDomain } from '@src/utils';
import { buildArNSRecordsQuery, queryClient } from '@src/utils/network';
import { RefetchOptions, useQuery } from '@tanstack/react-query';

export default function useDomainInfo({
  domain,
  antId,
}: {
  domain?: string;
  antId?: string;
}): {
  data: {
    arnsRecord?: AoArNSNameData;
    associatedNames?: string[];
    processId: string;
    antProcess: AoANTWrite | AoANTRead;
    name: string;
    ticker: string;
    owner: string;
    controllers: string[];
    undernameCount?: number;
    apexRecord: {
      transactionId: string;
      ttlSeconds: number;
    };
    records: Record<string, AoANTRecord>;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: (options?: RefetchOptions) => void;
} {
  const [{ arioContract: arioProvider, ioProcessId, aoNetwork }] =
    useGlobalState();
  const [{ wallet }] = useWalletState();

  // TODO: this should be modified or removed
  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['domainInfo', { domain, antId, ioProcessId, aoNetwork }],
    queryFn: () => getDomainInfo({ domain, antId }).catch((error) => error),
  });

  async function getDomainInfo({
    domain,
    antId,
  }: {
    domain?: string;
    antId?: string;
  }): Promise<{
    arnsRecord?: AoArNSNameData;
    associatedNames?: string[];
    processId: string;
    antProcess: AoANTWrite | AoANTRead;
    name: string;
    ticker: string;
    owner: string;
    controllers: string[];
    undernameCount: number;
    apexRecord: {
      transactionId: string;
      ttlSeconds: number;
    };
    records: Record<string, AoANTRecord>;
  }> {
    if (!domain && !antId) {
      throw new Error('No domain or antId provided');
    }

    const record = domain
      ? await arioProvider.getArNSRecord({
          name: lowerCaseDomain(domain),
        })
      : undefined;

    if (!antId && !record?.processId) {
      console.log(record);
      throw new Error('No ANT id or record found');
    }
    const processId = antId || record?.processId;
    const signer = wallet?.arconnectSigner;

    if (!processId) {
      throw new Error('No processId found');
    }

    const antProcess = ANT.init({
      processId: processId,
      ...(signer !== undefined ? { signer: signer as any } : {}),
    });

    const state = await antProcess.getState();
    if (!state) throw new Error('State not found for ANT contract');

    const arnsRecords = await queryClient.fetchQuery(
      buildArNSRecordsQuery({
        arioContract: arioProvider,
        meta: [ioProcessId, aoNetwork.CU_URL],
      }),
    );
    const associatedNames = Object.entries(arnsRecords)
      .filter(([, r]) => r.processId == processId.toString())
      .map(([d]) => d);

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
      records: state.Records,
    };
  }

  return {
    data,
    isLoading: isLoading || isRefetching,
    error,
    refetch: () => {
      queryClient.invalidateQueries({
        queryKey: ['domainInfo', { domain, antId }],
        refetchType: 'all',
      });
      refetch();
    },
  };
}
