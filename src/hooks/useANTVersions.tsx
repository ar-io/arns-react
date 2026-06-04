import { queryOptions, useQuery } from '@tanstack/react-query';

/**
 * AO ANT-module version registry shim.
 *
 * On AO, ANTs are Lua processes spawned from a versioned module — the version
 * registry maps ANT process IDs to their module's release notes / minimum
 * version. On Solana, ANTs are Metaplex Core NFTs and there's no concept of
 * a versioned Lua module; per-ANT schema migration happens via the `version:
 * u8` field on the AntConfig PDA, surfaced through `ANT.upgrade()` instead.
 *
 * This file is kept as a no-op stub so existing consumers keep compiling
 * after the de-AO refactor — every hook returns an empty/null payload that
 * the consumer code already treats as "no version available". Phase 6/7
 * removes the consumers that exclusively depended on this data.
 */

type AntVersionEntry = {
  notes: string;
  moduleId: string;
};

export function buildANTVersionsQuery(
  // Legacy AO args — accepted but ignored.
  _opts: Record<string, unknown> = {},
) {
  return queryOptions<Record<string, AntVersionEntry> | null>({
    queryKey: ['ant-versions', 'solana-stub'],
    queryFn: async () => null,
    staleTime: Infinity,
  });
}

export function useANTVersions() {
  return useQuery(buildANTVersionsQuery());
}

export function useLatestANTVersion() {
  return useQuery({
    queryKey: ['ant-latest-versions', 'solana-stub'],
    queryFn: async (): Promise<AntVersionEntry | null> => null,
    staleTime: Infinity,
  });
}
