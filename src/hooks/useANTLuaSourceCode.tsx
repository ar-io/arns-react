import { useGlobalState } from '@src/state';
import { DEFAULT_ANT_LUA_ID, DEFAULT_ARWEAVE } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useQuery } from '@tanstack/react-query';

export function useANTLuaSourceCode(id: string = DEFAULT_ANT_LUA_ID) {
  const [{ gateway, arweaveDataProvider }] = useGlobalState();

  return useQuery({
    queryKey: ['ant_lua_source_code', id, gateway],
    queryFn: async () => {
      const [gqlRes, luaCode] = await Promise.all([
        arweaveDataProvider.getGraphqlTransactions({ ids: [id] }),
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
