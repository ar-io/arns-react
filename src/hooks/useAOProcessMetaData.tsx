import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';
import arweaveGraphql from 'arweave-graphql';

export function useAOProcessMetaData({ processIds }: { processIds: string[] }) {
  const [{ gateway }] = useGlobalState();

  const arGql = arweaveGraphql(`${gateway}/graphql`);

  return useQuery
}
