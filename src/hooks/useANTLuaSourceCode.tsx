import { useGlobalState } from '@src/state';
import { DEFAULT_ANT_LUA_ID, DEFAULT_ARWEAVE } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useQuery } from '@tanstack/react-query';
import arweaveGraphql from 'arweave-graphql';

export class CompositeArweaveGraphqlProvider {
  private gqlProviders: Record<string, ReturnType<typeof arweaveGraphql>>;
  constructor(urls: string[] = ['https://arweave.net/graphql']) {
    this.gqlProviders = urls.reduce(
      (acc: Record<string, ReturnType<typeof arweaveGraphql>>, url) => {
        acc[url] = arweaveGraphql(url);
        return acc;
      },
      {},
    );
  }

  async getTransactions(
    args: Parameters<ReturnType<typeof arweaveGraphql>['getTransactions']>[0],
    requestHeaders?: Parameters<
      ReturnType<typeof arweaveGraphql>['getTransactions']
    >[1],
  ) {
    const results = await Promise.all(
      Object.values(this.gqlProviders).map((gql) =>
        gql.getTransactions(args, requestHeaders).catch((e) => {
          eventEmitter.emit('error', e);
          return { transactions: { edges: [] } };
        }),
      ),
    );

    return results.find((r) => r?.transactions?.edges?.length > 0);
  }
}

export function useANTLuaSourceCode(id: string = DEFAULT_ANT_LUA_ID) {
  const [{ gateway }] = useGlobalState();
  const gql = new CompositeArweaveGraphqlProvider([
    'https://arweave.net/graphql', // fallback to arweave.net for gql tx's
    gateway + '/graphql',
  ]);
  return useQuery({
    queryKey: ['ant_lua_source_code', id, gateway],
    queryFn: async () => {
      const [gqlRes, luaCode] = await Promise.all([
        gql.getTransactions({ ids: [id] }),
        DEFAULT_ARWEAVE.api
          .get(`/${id}`)
          .then((r) => r.data)
          .catch((e) =>
            console.error(
              new Error('Failed to fetch ANT Lua source code: ' + e.message),
            ),
          ),
      ]);
      const luaCodeTx = gqlRes?.transactions.edges.find(
        (n) => n.node.id == id,
      )?.node;
      const changelog = luaCodeTx?.tags?.find(
        (tag: any) => tag.name === 'Changelog',
      )?.value;
      const originalTxId = luaCodeTx?.tags?.find(
        (tag: any) => tag.name === 'Original-Tx-Id',
      )?.value;

      if (!luaCodeTx) {
        eventEmitter.emit(
          'error',
          new Error(
            'Unable to retrieve Lua source ID from graphql on ' + gateway,
          ),
        );
      }

      return { luaCodeTx, luaCode, changelog, originalTxId };
    },
  });
}
