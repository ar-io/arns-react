import Arweave from 'arweave';

export const arweave = Arweave.init({
  host: 'arweave.dev',
  port: 443,
  protocol: 'http',
});

export const buildQuery = (address: string) => {
  console.log(address);
  const queryObject = {
    query: `
    { 
      transactions (
        owners:["${address}"],
        tags:[
          {
            name: "App-Name",
            values: ["SmartWeaveContract"]
          },
          
        ],
        sort: HEIGHT_DESC,
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            block {
              height
            }
          }
        }
      }
    }`,
  };
  return queryObject;
};
