import {
  ANT,
  AOProcess,
  AoANTInfo,
  AoANTRead,
  AoANTRecord,
  AoANTState,
  AoANTWrite,
  AoArNSNameData,
} from '@ar.io/sdk/web';
import { isInGracePeriod } from '@src/components/layout/Navbar/NotificationMenu/NotificationMenu';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { lowerCaseDomain } from '@src/utils';
import { buildArNSRecordsQuery, queryClient } from '@src/utils/network';
import { RefetchOptions, useQuery } from '@tanstack/react-query';

/**
 * TODO: This hook is pretty gross in how it returns and types its data, needs a refactor.
 * 1. We want to return *only* the result of useQuery hook
 * 2. We want to intelligently set the stale time
 * 3. We want to calculate certain data like isInGracePeriod and other states accurately and return them accurately (eg, set the stale time to update on a timestamp so they get updated appropriately)
 * 4. We want individual cache keys for each request and leverage exist ones (we currently refetch all these when elsewhere they maybe were fetched, looking at arns records and ANT state, info, handlers)
 * 5. We want to return primary name data for the addresses associated with the domain (owner and controllers)
 * 6. We want to return the transactions history associated with the domain and ANT
 */

export default function useDomainInfo({
  domain,
  antId,
}: {
  domain?: string;
  antId?: string;
}): {
  data: {
    info: AoANTInfo;
    arnsRecord?: AoArNSNameData;
    associatedNames?: string[];
    processId: string;
    antProcess: AoANTWrite | AoANTRead;
    name: string;
    ticker: string;
    owner: string;
    controllers: string[];
    logo: string;
    undernameCount?: number;
    sourceCodeTxId?: string;
    apexRecord: {
      transactionId: string;
      ttlSeconds: number;
    };
    records: Record<string, AoANTRecord>;
    state: AoANTState;
    isInGracePeriod: boolean;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: (options?: RefetchOptions) => void;
} {
  const [
    { arioContract: arioProvider, arioProcessId, aoNetwork, antAoClient },
  ] = useGlobalState();
  const [{ wallet }] = useWalletState();

  // TODO: this should be modified or removed
  const {
    data,
    isLoading,
    isRefetching,
    isFetching,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['domainInfo', { domain, antId, arioProcessId, aoNetwork }],
    queryFn: () => getDomainInfo({ domain, antId }).catch((error) => error),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  async function getDomainInfo({
    domain,
    antId,
  }: {
    domain?: string;
    antId?: string;
  }): Promise<{
    info: AoANTInfo;
    arnsRecord?: AoArNSNameData;
    associatedNames?: string[];
    processId: string;
    antProcess: AoANTWrite | AoANTRead;
    name: string;
    ticker: string;
    owner: string;
    controllers: string[];
    logo: string;
    undernameCount: number;
    sourceCodeTxId?: string;
    apexRecord: {
      transactionId: string;
      ttlSeconds: number;
    };
    records: Record<string, AoANTRecord>;
    state: AoANTState;
    isInGracePeriod: boolean;
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
      throw new Error('No ANT id or record found');
    }
    const processId = antId || record?.processId;
    const signer = wallet?.contractSigner;

    if (!processId) {
      throw new Error('No processId found');
    }

    const antProcess = ANT.init({
      process: new AOProcess({
        processId,
        ao: antAoClient,
      }),
      ...(signer !== undefined ? { signer: signer as any } : {}),
    });

    const state = await antProcess.getState();
    if (!state) throw new Error('State not found for ANT contract');

    const arnsRecords = await queryClient.fetchQuery(
      buildArNSRecordsQuery({
        arioContract: arioProvider,
        meta: [arioProcessId, aoNetwork.ARIO.CU_URL],
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
    const info = await antProcess.getInfo();

    return {
      info,
      arnsRecord: record,
      associatedNames,
      processId,
      antProcess,
      name,
      ticker,
      owner,
      controllers,
      logo: state.Logo ?? '',
      undernameCount,
      apexRecord,
      // TODO: remove - not used
      sourceCodeTxId: (state as any)?.['Source-Code-TX-ID'],
      records: state.Records,
      state,
      // TODO: staletime for this hook can be configured around the endTimestamp on the record
      isInGracePeriod: record ? isInGracePeriod(record) : false,
    };
  }

  return {
    data,
    isLoading: isLoading || isRefetching || isFetching || isPending,
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
