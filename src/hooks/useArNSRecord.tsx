import { AoARIORead, AoArNSNameData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

/**
 * The Solana backend throws `Error("ArNS record not found: <name>")` when
 * the record doesn't exist, while the AO backend returns `undefined` (the
 * AO `Record` handler simply omits the result). Both shapes are valid
 * "absence" answers — surface them to the UI as `null` so we don't burn
 * react-query retries on a successful "no such name" lookup.
 */
function isRecordNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /arns record not found/i.test(error.message);
}

export function buildArNSRecordQuery({
  name,
  arioContract,
}: {
  name: string | undefined;
  arioContract: AoARIORead;
}): Parameters<typeof useQuery<AoArNSNameData>>[0] {
  return {
    queryKey: ['arns-record', name, arioContractCacheKey(arioContract)],
    queryFn: async () => {
      if (!isARNSDomainNameValid({ name }) || name === undefined)
        throw new Error('Invalid ArNS name');

      const record = await arioContract.getArNSRecord({ name });
      return record ?? null; // null is serializable, undefined is not
    },
  };
}

/**
 * `useQuery` wrapper that normalises Solana's "not found" throw into a
 * `null` data value (matching AO's `undefined` semantics) and avoids
 * retrying when a name simply doesn't exist. Search-as-you-type would
 * otherwise spam the RPC three times for every typo.
 */
export function useArNSRecord({ name }: { name: string | undefined }) {
  const [{ arioContract }] = useGlobalState();

  return useQuery<AoArNSNameData | null>({
    queryKey: ['arns-record', name, arioContractCacheKey(arioContract)],
    queryFn: async () => {
      if (!isARNSDomainNameValid({ name }) || name === undefined)
        throw new Error('Invalid ArNS name');

      try {
        const record = await arioContract.getArNSRecord({ name });
        return record ?? null;
      } catch (error) {
        if (isRecordNotFoundError(error)) return null;
        throw error;
      }
    },
    retry: (failureCount, error) =>
      !isRecordNotFoundError(error) && failureCount < 1,
  });
}
