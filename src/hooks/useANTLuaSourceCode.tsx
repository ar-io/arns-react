import { ANT_LUA_ID } from '@ar.io/sdk';
import { DEFAULT_ARWEAVE } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';

export function useANTLuaSourceCode(id: string = ANT_LUA_ID) {
  return useQuery({
    queryKey: ['ant_lua_source_code', id],
    queryFn: async () => {
      const [luaCodeTx, luaCode] = await Promise.all([
        DEFAULT_ARWEAVE.transactions.get(id),
        DEFAULT_ARWEAVE.transactions.getData(id, {
          decode: true,
          string: true,
        }),
      ]);
      const changelog = luaCodeTx?.tags
        ?.find(
          (tag: any) =>
            tag.get('name', { decode: true, string: true }) === 'Changelog',
        )
        ?.get('value', { decode: true, string: true });
      const originalTxId = luaCodeTx?.tags
        ?.find(
          (tag: any) =>
            tag.get('name', { decode: true, string: true }) ===
            'Original-Tx-Id',
        )
        ?.get('value', { decode: true, string: true });
      return { luaCodeTx, luaCode, changelog, originalTxId };
    },
  });
}
