import { ArweaveTransactionID } from './ArweaveTransactionID';

export const buildContractTxQuery = (id: ArweaveTransactionID) => {
  const queryObject = {
    query: `{
    transactions(first: 100, sort: HEIGHT_DESC,
      tags: [],
    ids:["${id.toString()}"]) {
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
