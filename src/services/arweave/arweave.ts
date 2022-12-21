import Arweave from 'arweave';

import { ArweaveTransactionId } from '../../types';

export const arweave = Arweave.init({
  host: 'arweave.dev',
  port: 443,
  protocol: 'https',
});

export const buildContractTxQuery = (contractId: ArweaveTransactionId) => {
  const queryObject = {
    query: `{
    transactions(first: 100, sort: HEIGHT_DESC,
      tags: [],
    ids:["${contractId}"]) {
      edges {
        node {
          id
          owner {
            address
          }
          data {
            size
          }
          block {
            height
            timestamp
          }
          tags {
            name,
            value
          }
        }
      }
    }
  }`,
  };
  return queryObject;
};
