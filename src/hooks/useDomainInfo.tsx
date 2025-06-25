import {
  ANT,
  AOProcess,
  AoANTRead,
  AoANTRecord,
  AoANTState,
  AoANTWrite,
  AoARIORead,
  AoArNSNameData,
} from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import { captureException } from '@sentry/react';
import { isInGracePeriod } from '@src/components/layout/Navbar/NotificationMenu/NotificationMenu';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ArNSWalletConnector } from '@src/types';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { ANTStateError } from '@src/utils/errors';
import {
  buildAntStateQuery,
  buildArNSRecordsQuery,
  queryClient,
} from '@src/utils/network';
import { useQuery } from '@tanstack/react-query';
import { TransactionEdge } from 'arweave-graphql';

import { buildANTVersionsQuery } from './useANTVersions';
import { buildGraphQLQuery } from './useGraphQL';

export type DomainInfo = {
  arnsRecord?: AoArNSNameData;
  associatedNames: string[];
  processId: string;
  antProcess: AoANTWrite | AoANTRead;
  name?: string;
  ticker?: string;
  owner?: string;
  controllers?: string[];
  logo: string;
  undernameCount?: number;
  sourceCodeTxId?: string;
  apexRecord?: {
    transactionId: string;
    ttlSeconds: number;
  };
  records?: Record<string, AoANTRecord>;
  state: AoANTState | null;
  isInGracePeriod?: boolean;
  processMeta?: TransactionEdge['node'] | null;
  errors: Error[];
  version: number;
};

export function buildDomainInfoQuery({
  domain,
  antId,
  arioContract,
  arioProcessId,
  aoNetwork,
  wallet,
}: {
  domain?: string;
  antId?: string;
  arioContract?: AoARIORead;
  arioProcessId?: string;
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
  wallet?: ArNSWalletConnector;
}): Parameters<typeof useQuery<DomainInfo>>[0] {
  return {
    // we are verbose here to enable predictable keys. Passing in the entire params as a single object can have unpredictable side effects
    queryKey: ['domainInfo', domain, antId, arioProcessId, aoNetwork],
    queryFn: async () => {
      const errors: Error[] = [];
      const antAo = connect(aoNetwork.ANT);
      const hyperbeamUrl = aoNetwork.ANT.HYPERBEAM_URL;

      const arnsRecords =
        domain && arioContract && arioProcessId
          ? await queryClient.fetchQuery(
              buildArNSRecordsQuery({
                arioContract,
                meta: [arioProcessId, aoNetwork.ARIO.CU_URL],
              }),
            )
          : undefined;

      if (!domain && !antId) {
        throw new Error('No domain or antId provided');
      }

      const record = domain && arnsRecords ? arnsRecords[domain] : undefined;

      if (!antId && !record?.processId) {
        throw new Error('No ANT id or record found');
      }
      const processId = antId || record?.processId;
      const signer = wallet?.contractSigner;

      if (!processId) {
        throw new Error('No processId found');
      }

      const antProcess = ANT.init({
        hyperbeamUrl,
        process: new AOProcess({
          processId,
          ao: antAo,
        }),
        ...(signer !== undefined ? { signer: signer as any } : {}),
      });

      const state = await queryClient
        .fetchQuery(buildAntStateQuery({ processId, ao: antAo }))
        .catch((e) => {
          captureException(e);
          errors.push(
            new ANTStateError(
              e?.message ?? 'Unknown Error - Unable to fetch ANT state',
            ),
          );
          return null;
        });

      const processMeta = await queryClient
        .fetchQuery(
          buildGraphQLQuery(aoNetwork.ANT.GRAPHQL_URL, { ids: [processId] }),
        )
        .then((res) => res?.transactions.edges[0].node)
        .catch((e) => {
          console.error(e);
          return null;
        });

      const associatedNames = arnsRecords
        ? Object.entries(arnsRecords)
            .filter(([, r]) => r.processId == processId.toString())
            .map(([d]) => d)
        : [];

      const {
        Name: name,
        Ticker: ticker,
        Owner: owner,
        Controllers: controllers,
        Records: records,
      } = state ?? {};
      const apexRecord = records?.['@'];
      const undernameCount = Object.keys(records ?? {}).filter(
        (k) => k !== '@',
      ).length;

      const antVersions = await queryClient.fetchQuery(
        buildANTVersionsQuery({ aoNetwork }),
      );

      const moduleId =
        processMeta?.tags.find((tag) => tag.name === 'Module')?.value ?? '';

      const version = Object.keys(antVersions ?? {}).find(
        (versionNumber) => antVersions[versionNumber].moduleId === moduleId,
      );

      const results: DomainInfo = {
        arnsRecord: record,
        associatedNames,
        processId,
        antProcess,
        name,
        ticker,
        owner,
        controllers,
        logo: state?.Logo ?? '',
        undernameCount,
        apexRecord,
        records: state?.Records,
        state,
        errors,
        // TODO: staletime for this hook can be configured around the endTimestamp on the record
        isInGracePeriod: record ? isInGracePeriod(record) : false,
        processMeta: processMeta
          ? (processMeta as TransactionEdge['node'])
          : null,
        version: version ? parseInt(version) : 0,
      };

      return results;
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: !!(domain || antId),
  };
}

export default function useDomainInfo({
  domain,
  antId,
}: {
  domain?: string;
  antId?: string;
}) {
  const [{ arioContract, arioProcessId, aoNetwork }] = useGlobalState();
  const [{ wallet }] = useWalletState();

  // TODO: this should be modified or removed
  const query = useQuery(
    buildDomainInfoQuery({
      domain,
      antId,
      aoNetwork,
      arioContract,
      arioProcessId,
      wallet,
    }),
  );

  return {
    ...query,
    refetch: () => {
      queryClient.resetQueries({
        queryKey: ['ant', antId],
      });
      queryClient.resetQueries({
        queryKey: ['ant-info', antId],
      });
      queryClient.resetQueries({
        queryKey: ['domainInfo', antId],
      });
      queryClient.resetQueries({
        queryKey: ['domainInfo', domain],
      });
    },
  };
}
