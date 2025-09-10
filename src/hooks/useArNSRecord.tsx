import { AoARIORead, AoArNSNameData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
import { useQuery } from '@tanstack/react-query';

export function buildArNSRecordQuery({
  name,
  arioContract,
}: {
  name: string | undefined;
  arioContract: AoARIORead;
}): Parameters<typeof useQuery<AoArNSNameData>>[0] {
  return {
    queryKey: ['arns-record', name, arioContract.process.processId],
    queryFn: async () => {
      if (!isARNSDomainNameValid({ name }) || name === undefined)
        throw new Error('Invalid ArNS name');

      const record = await arioContract.getArNSRecord({ name });
      return record ?? null; // null is serializable, undefined is not
    },
  };
}

export function useArNSRecord({ name }: { name: string | undefined }) {
  const [{ arioContract }] = useGlobalState();
  return useQuery(buildArNSRecordQuery({ name, arioContract }));
}
