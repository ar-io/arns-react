import { defaultDataProvider } from '../services/arweave';
import { arweave, buildContractTxQuery } from '../services/arweave/arweave';
import { ArweaveTransactionId } from '../types';
import {
  ANT_CONTRACT_STATE_KEYS,
  ARNS_NAME_REGEX,
  ARNS_TXID_REGEX,
} from './constants';

export function isArNSDomainNameValid({ name }: { name?: string }): boolean {
  // if name is not in the legal character range or chars, return undefined

  if (!name || !ARNS_NAME_REGEX.test(name)) {
    return false;
  }
  return true;
}

export function isArNSDomainNameAvailable({
  name,
  records,
}: {
  name?: string;
  records: Record<string, any>;
}): boolean {
  //if registered return false
  if (!name || Object.keys(records).includes(name)) {
    return false;
  }
  return true;
}

export function calculateArNSNamePrice({
  domain,
  years,
  selectedTier,
  fees,
}: {
  domain?: string;
  years: number;
  selectedTier: number;
  fees: { [x: number]: number };
}) {
  try {
    if (years < 1) {
      throw Error('Minimum duration must be at least one year');
    }
    if (selectedTier < 1) {
      throw Error('Minimum selectedTier is 1');
    }
    if (selectedTier > 3) {
      throw Error('Maximum selectedTier is 3');
    }
    if (!domain) {
      throw Error('Domain is undefined');
    }
    if (!isArNSDomainNameValid({ name: domain })) {
      throw Error('Domain name is invalid');
    }
    const nameLength = Math.min(domain.length, Object.keys(fees).length);
    const namePrice = fees[nameLength];
    const price = namePrice * years * selectedTier;
    return price;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export function isArweaveTransactionID(id: string) {
  if (!id) {
    return false;
  }
  if (!ARNS_TXID_REGEX.test(id)) {
    return false;
  }
  return true;
}

export async function isAntValid(
  id: string,
  approvedANTSourceCodeTxs: ArweaveTransactionId[],
): Promise<boolean> {
  try {
    if (!ARNS_TXID_REGEX.test(id)) {
      throw Error('ANT ID Not a valid arweave transaction ID');
    }
    const contractTxnData = await arweave.api
      .post('/graphql', buildContractTxQuery(id))
      .then((res) => {
        return res.data.data.transactions.edges[0].node;
      });
    contractTxnData.tags = tagsToObject(contractTxnData.tags);
    if (!contractTxnData.tags['Contract-Src']) {
      throw Error('Invalid WARP CONTRACT tags - missing Contract-Src tag');
    }
    if (
      !approvedANTSourceCodeTxs.includes(contractTxnData.tags['Contract-Src'])
    ) {
      throw Error(`ANT is not using an approved source code contract, approved source codes are ${approvedANTSourceCodeTxs.map(
        (srcCodeID: string) => {
          return `${srcCodeID} `;
        },
      )}
    and yours is ${contractTxnData.tags['Contract-Src']}`);
    }

    const dataProvider = defaultDataProvider(id);
    dataProvider.getContractState(id).then((antContractState) => {
      console.log(antContractState);
      if (!antContractState) {
        throw Error(
          `${id} is not a valid ANT contract, you may only register a name to a valid ANT contract`,
        );
      }
      const keyResults = ANT_CONTRACT_STATE_KEYS.map((key) =>
        Object.keys(antContractState).includes(key),
      );
      if (keyResults.includes(false)) {
        const missingKeys = () => {
          let keys = [];
          for (let i = 0; i < keyResults.length; i++) {
            if (keyResults[i] === false) {
              keys.push(ANT_CONTRACT_STATE_KEYS[i]);
            }
          }
          return keys;
        };
        throw Error(
          `${id} is not a valid ANT contract, the state key(s) "${missingKeys()}" are missing. Update the ANT contract to include these keys in order to make it a valid contract.`,
        );
      }
    });
    // check to make sure confirmations on ant meet requirements
    const confirmations = await arweave.api
      .get(`/tx/${id}/status`)
      .then((res) => res.data.number_of_confirmations);
    if (!confirmations || confirmations < 50) {
      throw Error(
        `Your ANT contract does not have enough confirmations, you have to wait ${
          50 - +confirmations
        } more confirmations.`,
      );
    }
    return true;
  } catch (Error) {
    console.error(Error);
    return false;
  }
}

export function tagsToObject(tags: Array<{ name: string; value: string }>) {
  const newTags: { [x: string]: string } = {};
  tags.map((tag) => (newTags[tag.name] = tag.value));

  return newTags;
}
