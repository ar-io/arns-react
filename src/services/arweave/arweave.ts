import { ArweaveTransactionId } from '../../types';

export const buildContractTxQuery = (id: ArweaveTransactionId) => {
  const queryObject = {
    query: `{
    transactions(first: 100, sort: HEIGHT_DESC,
      tags: [],
    ids:["${id}"]) {
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
