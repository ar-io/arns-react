import { address, fetchEncodedAccount } from '@solana/kit';
import { getSolanaRpc } from '@src/utils/solana';
import { useQuery } from '@tanstack/react-query';

export type MetaplexAttribute = {
  key: string;
  value: string;
};

export type MetaplexAttributesInfo = {
  assetName: string;
  assetUri: string;
  attributes: MetaplexAttribute[];
};

const ATTRIBUTES_PLUGIN_TYPE = 6;
const ADDRESS_LENGTH = 32;

function readU32(data: Uint8Array, offset: number) {
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(
    offset,
    true,
  );
}

function readU64AsNumber(data: Uint8Array, offset: number) {
  return Number(
    new DataView(data.buffer, data.byteOffset, data.byteLength).getBigUint64(
      offset,
      true,
    ),
  );
}

function readString(data: Uint8Array, offset: number) {
  const length = readU32(data, offset);
  const start = offset + 4;
  const end = start + length;

  return {
    value: new TextDecoder().decode(data.slice(start, end)),
    offset: end,
  };
}

function skipUpdateAuthority(data: Uint8Array, offset: number) {
  const variant = data[offset];
  if (variant === undefined) throw new Error('Missing update authority');

  return offset + 1 + (variant === 1 || variant === 2 ? ADDRESS_LENGTH : 0);
}

function skipAuthority(data: Uint8Array, offset: number) {
  const variant = data[offset];
  if (variant === undefined) throw new Error('Missing plugin authority');

  return offset + 1 + (variant === 3 ? ADDRESS_LENGTH : 0);
}

function readAttributesPlugin(
  data: Uint8Array,
  pluginOffset: number,
): MetaplexAttribute[] {
  let offset = pluginOffset;
  const pluginType = data[offset];
  offset += 1;

  if (pluginType !== ATTRIBUTES_PLUGIN_TYPE) {
    return [];
  }

  const attributeCount = readU32(data, offset);
  offset += 4;

  const attributes: MetaplexAttribute[] = [];
  for (let i = 0; i < attributeCount; i += 1) {
    const key = readString(data, offset);
    const value = readString(data, key.offset);

    attributes.push({ key: key.value, value: value.value });
    offset = value.offset;
  }

  return attributes;
}

export function parseMetaplexAttributes(
  data: Uint8Array,
): MetaplexAttributesInfo {
  let offset = 1 + ADDRESS_LENGTH;
  offset = skipUpdateAuthority(data, offset);

  const name = readString(data, offset);
  const uri = readString(data, name.offset);
  offset = uri.offset;

  const seqVariant = data[offset];
  if (seqVariant === undefined) throw new Error('Missing asset sequence');
  offset += 1 + (seqVariant === 1 ? 8 : 0);

  if (offset >= data.length) {
    return { assetName: name.value, assetUri: uri.value, attributes: [] };
  }

  // PluginHeaderV1: key (u8) + pluginRegistryOffset (u64 LE).
  const registryOffset = readU64AsNumber(data, offset + 1);
  if (registryOffset >= data.length) {
    return { assetName: name.value, assetUri: uri.value, attributes: [] };
  }

  offset = registryOffset + 1;
  const registryCount = readU32(data, offset);
  offset += 4;

  for (let i = 0; i < registryCount; i += 1) {
    const pluginType = data[offset];
    offset += 1;

    offset = skipAuthority(data, offset);
    const pluginOffset = readU64AsNumber(data, offset);
    offset += 8;

    if (pluginType === ATTRIBUTES_PLUGIN_TYPE) {
      return {
        assetName: name.value,
        assetUri: uri.value,
        attributes: readAttributesPlugin(data, pluginOffset),
      };
    }
  }

  return { assetName: name.value, assetUri: uri.value, attributes: [] };
}

export default function useMetaplexAttributes(processId?: string) {
  return useQuery({
    queryKey: ['metaplex-attributes', processId],
    enabled: !!processId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!processId) throw new Error('Must provide an ANT asset id');

      const account = await fetchEncodedAccount(
        getSolanaRpc(),
        address(processId),
        {
          commitment: 'confirmed',
        },
      );

      if (!account.exists) {
        throw new Error('Metaplex asset account not found');
      }

      return parseMetaplexAttributes(new Uint8Array(account.data));
    },
  });
}
