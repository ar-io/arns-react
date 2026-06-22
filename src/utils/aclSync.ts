/**
 * ACL drift detection + sync.
 *
 * The on-chain ANT ACL (ADR-012 paginated `AclConfig` + `AclPage` PDAs) is an
 * eventually-consistent secondary index of the ANTs a wallet owns/controls.
 * Marketplace transfers move the Metaplex Core asset immediately, but the ACL
 * is only updated when someone calls the `record_acl_*` instructions — so the
 * ACL can lag actual on-chain ownership.
 *
 * This module finds that drift from the ground-truth side:
 *
 *   1. Enumerate every MPL Core asset the wallet actually owns (a
 *      `getProgramAccounts` owner scan against `MPL_CORE_PROGRAM_ID`) that
 *      carries the `ANT Program` attribute — i.e. the asset is an ANT.
 *   2. Reverse-look-up the ArNS name(s) pointing at each owned asset
 *      (`getArNSRecordsByAntMints`).
 *   3. Read the wallet's ACL (`Owned ∪ Controlled`).
 *   4. Any owned asset that backs an ArNS name but is missing from the ACL is
 *      drifted — calling `syncAttributes({ name })` reconciles it.
 *
 * `syncAttributes` is a permissionless cache-sync on the SDK's ARIO write
 * client; the caller must be the current asset owner (which, by construction,
 * every target here is).
 */
import {
  type ARIORead,
  type ArNSNameDataWithName,
  MPL_CORE_PROGRAM_ID,
  SolanaANTRegistryReadable,
} from '@ar.io/sdk/web';
import { type Address, getBase58Decoder } from '@solana/kit';

import {
  type MetaplexAttribute,
  parseMetaplexAttributes,
} from '../hooks/useMetaplexAttributes';
import {
  SOLANA_COMMITMENT,
  getActiveSolanaConfig,
  getSolanaRpc,
} from './solana';

/**
 * Trait key written into an ANT's Metaplex Core Attributes plugin that holds
 * the (base58) ANT program id. Its presence is what distinguishes an ANT asset
 * from any other Core NFT the wallet might hold. Mirrors
 * `TRAIT_KEY_ANT_PROGRAM` in `@ar.io/sdk` (`src/solana/mpl-core.ts`) — the SDK
 * does not re-export it, so it is duplicated here.
 */
export const TRAIT_KEY_ANT_PROGRAM = 'ANT Program' as const;

/**
 * `MetaplexCoreAssetV1` accounts begin with a 1-byte `Key` enum discriminant;
 * `Key::AssetV1 === 1`. We bs58-encode it for a `memcmp` filter at offset 0 so
 * the owner scan only matches assets (not plugin/registry/collection
 * accounts). The owner `Pubkey` follows immediately at offset 1.
 */
const KEY_ASSET_V1_BASE58 = getBase58Decoder().decode(new Uint8Array([1]));
const ASSET_V1_OWNER_OFFSET = 1n;

type ProgramAccount = {
  pubkey: Address;
  account: { data: readonly [string, string] };
};

function hasAntProgramAttribute(attributes: MetaplexAttribute[]): boolean {
  return attributes.some((a) => a.key === TRAIT_KEY_ANT_PROGRAM);
}

/**
 * Enumerate every MPL Core asset owned by `owner` that carries the `ANT
 * Program` attribute. Returns the asset addresses (ANT mints).
 *
 * Uses a single `getProgramAccounts` owner scan — the account data is returned
 * inline (base64), so attributes are parsed without a per-asset round trip.
 */
export async function scanOwnedAntAssetMints({
  owner,
  rpc = getSolanaRpc(),
}: {
  owner: string;
  rpc?: ReturnType<typeof getSolanaRpc>;
}): Promise<string[]> {
  const result = (await (rpc as any)
    .getProgramAccounts(MPL_CORE_PROGRAM_ID, {
      commitment: SOLANA_COMMITMENT,
      encoding: 'base64',
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: KEY_ASSET_V1_BASE58,
            encoding: 'base58',
          },
        },
        {
          memcmp: {
            offset: ASSET_V1_OWNER_OFFSET,
            bytes: owner,
            encoding: 'base58',
          },
        },
      ],
    })
    .send()) as ReadonlyArray<ProgramAccount>;

  const mints: string[] = [];
  for (const entry of result) {
    try {
      const data = new Uint8Array(Buffer.from(entry.account.data[0], 'base64'));
      const { attributes } = parseMetaplexAttributes(data);
      if (hasAntProgramAttribute(attributes)) {
        mints.push(entry.pubkey.toString());
      }
    } catch {
      // Best-effort: skip any asset whose layout we can't parse.
    }
  }
  return mints;
}

/**
 * Read the wallet's on-chain ACL and return the set of asset addresses it
 * knows about (owned ∪ controlled). Empty when the wallet has no `AclConfig`.
 */
export async function fetchAclAssetSet({
  address,
  rpc = getSolanaRpc(),
}: {
  address: string;
  rpc?: ReturnType<typeof getSolanaRpc>;
}): Promise<Set<string>> {
  const { programIds } = getActiveSolanaConfig();
  const registry = new SolanaANTRegistryReadable({
    rpc: rpc as any,
    commitment: SOLANA_COMMITMENT,
    antProgramId: programIds.antProgramId,
  });
  const { Owned, Controlled } = await registry.accessControlList({ address });
  return new Set([...Owned, ...Controlled]);
}

/**
 * Compute the ArNS records that have drifted out of `owner`'s ACL: names whose
 * backing ANT asset the wallet actually owns on-chain (per MPL Core) but which
 * are absent from the wallet's paginated ACL — typically the result of an
 * out-of-band Metaplex Core transfer that bypassed the SDK's ACL maintenance.
 *
 * These records are NOT returned by `getArNSRecordsForAddress` (it walks the
 * ACL), so callers that want them surfaced — the manage table, the Sync
 * Ownership flow — must merge them in and flag them for `syncAcl`.
 *
 * `ario` must be a Solana ARIO read client (it carries the concrete
 * `getArNSRecordsByAntMints`, which is not on the cross-backend `ARIORead`
 * interface).
 */
export async function computeAclDrift({
  owner,
  ario,
  rpc = getSolanaRpc(),
}: {
  owner: string;
  ario: ARIORead;
  rpc?: ReturnType<typeof getSolanaRpc>;
}): Promise<ArNSNameDataWithName[]> {
  const ownedMints = await scanOwnedAntAssetMints({ owner, rpc });
  if (ownedMints.length === 0) return [];

  const [records, aclSet] = await Promise.all([
    (
      ario as unknown as {
        getArNSRecordsByAntMints: (args: {
          mints: ReadonlyArray<string>;
        }) => Promise<ArNSNameDataWithName[]>;
      }
    ).getArNSRecordsByAntMints({ mints: ownedMints }),
    fetchAclAssetSet({ address: owner, rpc }),
  ]);

  return records.filter((r) => r.processId && !aclSet.has(r.processId));
}
