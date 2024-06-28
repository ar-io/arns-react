import { ANT, AoANTRead, AoANTWrite, AoArNSNameData } from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { lowerCaseDomain } from '@src/utils';
import { buildArNSRecordsQuery, queryClient } from '@src/utils/network';
import { RefetchOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
  };
  isLoading: boolean;
  error: Error | null;
  refetch: (options?: RefetchOptions) => void;
} {
  const [{ arioContract: arioProvider }] = useGlobalState();
  const [{ wallet }] = useWalletState();

  // using this to have useDomainInfo hook trigger updates for React
  const [refreshing, setRefreshing] = useState(false);

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
  }> {
    if (refreshing) {
      throw new Error('Already refreshing');
    }
    try {
      setRefreshing(true);
      if (!domain && !antId) {
        throw new Error('No domain or antId provided');
      }

      const record = domain
        ? await arioProvider.getArNSRecord({
            name: lowerCaseDomain(domain),
          })
        : undefined;

      if (!antId && !record?.processId) {
        throw new Error('No processId found');
      }
      const processId = antId || new ArweaveTransactionID(record?.processId);
      const signer = wallet?.arconnectSigner;

      const antProcess = ANT.init({
        processId: processId.toString(),
        ...(signer !== undefined ? { signer: signer as any } : {}),
      });

      const state = await antProcess.getState();
      if (!state) throw new Error('State not found for ANT contract');

      const arnsRecords = await queryClient.fetchQuery(
        buildArNSRecordsQuery({ arioContract: arioProvider }),
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
      const undernameCount = Object.keys(records).filter(
        (k) => k !== '@',
      ).length;

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
    } finally {
      setRefreshing(false);
    }
  }

  return { data, isLoading, error, refetch };
}
