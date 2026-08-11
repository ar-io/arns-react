import {
  ANTRead,
  ANTRecord,
  ANTState,
  ANTWrite,
  ARIORead,
  ArNSNameData,
} from '@ar.io/sdk/web';
import { isInGracePeriod } from '@src/components/layout/Navbar/NotificationMenu/NotificationMenu';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ArNSWalletConnector } from '@src/types';
import { lowerCaseDomain } from '@src/utils';
import { ANTStateError } from '@src/utils/errors';
import { buildAntStateQuery, queryClient } from '@src/utils/network';
import { useQuery } from '@tanstack/react-query';
import { TransactionEdge } from 'arweave-graphql';
import { buildArNSRecordQuery } from './useArNSRecord';

export type DomainInfo = {
  arnsRecord?: ArNSNameData;
  associatedNames: string[];
  processId: string;
  antProcess: ANTWrite | ANTRead;
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
  records?: Record<string, ANTRecord>;
  state: ANTState | null;
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
  arioContract?: ARIORead;
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

      if (!domain && !antId) {
        throw new Error('No domain or antId provided');
      }

      // Fast path: look up the single record by name (one PDA read) instead
      // of scanning the entire ArNS registry via getArNSRecords.
      const record =
        domain && arioContract
          ? await queryClient.fetchQuery(
              buildArNSRecordQuery({
                name: lowerCaseDomain(domain),
                arioContract,
              }),
            )
          : undefined;

      if (!antId && !record?.processId) {
        throw new Error('No ANT id or record found');
      }
      const processId = antId || record?.processId;

      if (!processId) {
        throw new Error('No processId found');
      }

      // Kick off ANT state + ANT write-instance fetch in parallel.
      const { buildAnt } = await import('@src/utils/sdk-init');
      const [state, antProcess] = await Promise.all([
        queryClient
          .fetchQuery(buildAntStateQuery({ processId, solana: true } as any))
          .catch((e) => {
            console.error(e);
            errors.push(
              new ANTStateError(
                e?.message ?? 'Unknown Error - Unable to fetch ANT state',
              ),
            );
            return null;
          }),
        buildAnt({ wallet, processId }),
      ]);

      // Associated names: look up all records pointing at this ANT. Now that
      // we have the real processId the SDK uses a targeted memcmp filter
      // (one gPA per mint) instead of scanning every record on-chain.
      let associatedNames: string[] = [];
      if (arioContract) {
        try {
          const { items } = await arioContract.getArNSRecords({
            filters: { processId },
          });
          associatedNames = items.map((r) => r.name);
        } catch {
          // Non-critical — the manage page still works without it.
          associatedNames = domain ? [domain] : [];
        }
      }

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
        arnsRecord: record ?? undefined,
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
      const keyNames = ['ant', 'ant-info', 'arns-record', 'domainInfo'];
      const normalizedDomain = domain ? lowerCaseDomain(domain) : undefined;
      const keyVals = [antId, domain, normalizedDomain].filter(
        (value): value is string => value !== undefined,
      );
      queryClient.invalidateQueries({
        predicate: (query) =>
          keyNames.some((name) => query.queryKey.includes(name)) &&
          keyVals.some((value) => query.queryKey.includes(value)),
      });

      return query.refetch();
    },
  };
}
