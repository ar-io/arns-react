/**
 * ACL drift detection.
 *
 * The on-chain ANT ACL (ADR-012 paginated `AclConfig` + `AclPage` PDAs) is an
 * eventually-consistent secondary index of the ANTs a wallet owns/controls.
 * Raw Metaplex Core transfers move the asset immediately, but the ACL is only
 * updated when someone calls the `record_acl_*` / `remove_acl_*` instructions —
 * so it lags actual on-chain ownership in both directions:
 *
 *   - Receiver side: the new owner's ACL is missing the asset, so the name
 *     disappears from `getArNSRecordsForAddress` until `syncAcl` records it.
 *   - Sender side: the old owner's ACL (and `AntConfig.last_known_owner`) still
 *     point at the asset, so it lingers in their list until reconciled.
 *
 * This module establishes ground truth from the MPL Core side via a single
 * `getProgramAccounts` owner-scan against `MPL_CORE_PROGRAM_ID` (filtered to
 * assets carrying the `ANT Program` attribute, i.e. ANTs). {@link computeAclDrift}
 * returns both the drifted-in records (receiver) and the full owned-asset set
 * (which the refresh uses to drop transferred-away ANTs — sender). Drifted-in
 * names are reconciled by the SDK's `syncAcl`.
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

export type AclDriftResult = {
  /**
   * ArNS records whose backing ANT asset the wallet owns on-chain (per MPL
   * Core) but which are absent from the wallet's ACL — typically the result of
   * an out-of-band Metaplex Core transfer that bypassed the SDK's ACL
   * maintenance. NOT returned by `getArNSRecordsForAddress` (it walks the ACL),
   * so callers must merge them in and flag them for `syncAcl`.
   */
  driftRecords: ArNSNameDataWithName[];
  /**
   * Every MPL Core ANT asset the wallet currently owns on-chain — the ground
   * truth for "do I own this ANT?". Callers use it to drop ACL-listed ANTs the
   * wallet has since transferred away (the ACL / `last_known_owner` lag).
   */
  ownedMints: Set<string>;
};

/**
 * Reconcile `owner`'s ACL against ground-truth MPL Core ownership in a single
 * owner-scan: returns both the names that drifted *out* of the ACL (owned but
 * unlisted — receiver side) and the full set of assets the wallet actually
 * owns (used to drop ACL entries the wallet no longer owns — sender side).
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
}): Promise<AclDriftResult> {
  const ownedList = await scanOwnedAntAssetMints({ owner, rpc });
  const ownedMints = new Set(ownedList);
  if (ownedList.length === 0) {
    return { driftRecords: [], ownedMints };
  }

  const [records, aclSet] = await Promise.all([
    (
      ario as unknown as {
        getArNSRecordsByAntMints: (args: {
          mints: ReadonlyArray<string>;
        }) => Promise<ArNSNameDataWithName[]>;
      }
    ).getArNSRecordsByAntMints({ mints: ownedList }),
    fetchAclAssetSet({ address: owner, rpc }),
  ]);

  return {
    driftRecords: records.filter(
      (r) => r.processId && !aclSet.has(r.processId),
    ),
    ownedMints,
  };
}
