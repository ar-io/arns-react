import { type Address } from '@solana/kit';
import { SOLANA_COMMITMENT, getSolanaRpc } from '@src/utils/solana';

export type LegacyAccountInfo = {
  data: Buffer;
  owner: string;
  lamports: number;
  executable: boolean;
  rentEpoch: number;
};

export async function getAccountInfoLegacy(
  rpc: ReturnType<typeof getSolanaRpc>,
  pda: Address,
  commitment = SOLANA_COMMITMENT,
): Promise<LegacyAccountInfo | null> {
  const res = await rpc
    .getAccountInfo(pda, {
      encoding: 'base64',
      commitment,
    })
    .send();

  if (!res.value) return null;

  const [dataB64] = res.value.data as [string, string];
  return {
    data: Buffer.from(dataB64, 'base64'),
    owner: res.value.owner as string,
    lamports: Number(res.value.lamports),
    executable: res.value.executable,
    rentEpoch: 0,
  };
}

export async function getMultipleAccountsInfoLegacy(
  rpc: ReturnType<typeof getSolanaRpc>,
  pdas: Address[],
  commitment = SOLANA_COMMITMENT,
): Promise<(LegacyAccountInfo | null)[]> {
  if (pdas.length === 0) return [];

  const res = await rpc
    .getMultipleAccounts(pdas, {
      encoding: 'base64',
      commitment,
    })
    .send();

  return res.value.map((acct: any) => {
    if (!acct) return null;
    const [dataB64] = acct.data as [string, string];
    return {
      data: Buffer.from(dataB64, 'base64'),
      owner: acct.owner as string,
      lamports: Number(acct.lamports),
      executable: acct.executable,
      rentEpoch: 0,
    };
  });
}
