import {
  ANT,
  ANTState,
  ArIO,
  ArNSBaseNameData,
  ArNSLeaseData,
} from '@ar.io/sdk/web';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function useDomainInfo(domain?: string) {
  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: ['domainInfo', { domain }],
    queryFn: () => getDomainInfo({ domain }).catch((error) => error),
  });

  async function getDomainInfo({ domain }: { domain?: string }): Promise<{
    // arnsRecord: any;
    // antState: any;
    arnsRecord: ArNSLeaseData & ArNSBaseNameData;
    antState: ANTState;
  }> {
    if (!domain) {
      return {
        arnsRecord: {} as ArNSLeaseData & ArNSBaseNameData,
        antState: {} as ANTState,
      };
    }
    const arIOReadable = ArIO.init();
    const record = await arIOReadable.getArNSRecord({ domain });
    if (!record) {
      return {
        arnsRecord: {} as ArNSLeaseData & ArNSBaseNameData,
        antState: {} as ANTState,
      };
    }
    const antReadable = ANT.init({
      contractTxId: record?.contractTxId.toString(),
    });
    const antState = await antReadable.getState();
    return {
      arnsRecord: record as ArNSLeaseData & ArNSBaseNameData,
      antState,
    };
  }

  return { data, isLoading, error };
}
