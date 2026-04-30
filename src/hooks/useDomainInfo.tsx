import {
  AoANTRead,
  AoANTRecord,
  AoANTState,
  AoANTWrite,
  AoARIORead,
  AoArNSNameData,
} from '@ar.io/sdk/web';
import { captureException } from '@sentry/react';
import { isInGracePeriod } from '@src/components/layout/Navbar/NotificationMenu/NotificationMenu';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ArNSWalletConnector } from '@src/types';
import { ANTStateError } from '@src/utils/errors';
import {
  buildAntStateQuery,
  buildArNSRecordsQuery,
  queryClient,
} from '@src/utils/network';
import { useQuery } from '@tanstack/react-query';
import { TransactionEdge } from 'arweave-graphql';

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
  /**
   * Arweave GraphQL meta describing the ANT's Lua-process spawn tx. Always
   * `null` on Solana — Metaplex Core NFTs don't have an Arweave tx. Kept
   * in the type for compatibility with existing consumers; remove in a
   * follow-up refactor.
   */
  processMeta?: TransactionEdge['node'] | null;
  errors: Error[];
  /**
   * ANT-module version. Always `0` on Solana — schema migration is
   * surfaced through `ANT.upgrade()` and the AntConfig PDA's `version: u8`
   * field, not via a module registry. Kept for consumer compatibility.
   */
  version: number;
};

export function buildDomainInfoQuery({
  domain,
  antId,
  arioContract,
  wallet,
}: {
  domain?: string;
  antId?: string;
  arioContract?: AoARIORead;
  wallet?: ArNSWalletConnector;
  // Legacy AO args — accepted but ignored.
  arioProcessId?: string;
  antRegistryProcessId?: string;
  aoNetwork?: unknown;
  hyperbeamUrl?: string;
}): Parameters<typeof useQuery<DomainInfo>>[0] {
  return {
    queryKey: ['domainInfo', domain, antId],
    queryFn: async () => {
      const errors: Error[] = [];

      const arnsRecords =
        domain && arioContract
          ? await queryClient.fetchQuery(
              buildArNSRecordsQuery({
                arioContract,
                filters: { processId: antId },
              }),
            )
          : undefined;

      if (!domain && !antId) {
        throw new Error('No domain or antId provided');
      }

      const record = arnsRecords?.find((r) => r.name === domain);

      if (!antId && !record?.processId) {
        throw new Error('No ANT id or record found');
      }
      const processId = antId || record?.processId;

      if (!processId) {
        throw new Error('No processId found');
      }

      const { buildAnt } = await import('@src/utils/sdk-init');
      const antProcess = await buildAnt({ wallet, processId });

      const state = await queryClient
        .fetchQuery(buildAntStateQuery({ processId, solana: true } as any))
        .catch((e) => {
          captureException(e);
          errors.push(
            new ANTStateError(
              e?.message ?? 'Unknown Error - Unable to fetch ANT state',
            ),
          );
          return null;
        });

      const associatedNames = arnsRecords
        ? arnsRecords
            .filter((r) => r.processId === processId.toString())
            .map((r) => r.name)
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
        isInGracePeriod: record ? isInGracePeriod(record) : false,
        // Always null on Solana (no Arweave tx behind a Metaplex Core NFT).
        processMeta: null,
        // Always 0 on Solana (no Lua module registry).
        version: 0,
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
  const [{ arioContract }] = useGlobalState();
  const [{ wallet }] = useWalletState();

  const query = useQuery(
    buildDomainInfoQuery({
      domain,
      antId,
      arioContract,
      wallet,
    }),
  );

  return {
    ...query,
    refetch: () => {
      const keyNames = ['ant', 'ant-info', 'domainInfo'];
      const keyVals = [antId, domain];
      queryClient.invalidateQueries({
        predicate: (query) =>
          keyNames.some((name) => query.queryKey.includes(name)) &&
          keyVals.some((value) => query.queryKey.includes(value)),
      });

      return query.refetch();
    },
  };
}
