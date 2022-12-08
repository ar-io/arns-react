// note: lookahead/lookbehind regex's are not compatible with iOS browsers
export const ARNS_NAME_REGEX = new RegExp(
  '^([a-zA-Z0-9][a-zA-Z0-9-]{0,30}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
);
export const ARNS_TXID_REGEX = new RegExp('^[a-z0-9-s+]{43}$');

// TODO: don't use
export const DEFAULT_EXPIRATION = new Date('12/31/2023');
// TODO: pull from contract
export const FEATURED_DOMAINS = [
  'arcode',
  'ardrive',
  'arns',
  'blog',
  'connect',
  'permapages',
  'pst',
  'sam',
  'search',
  'wallet',
];

// TODO: pull from contract
export const TIER_DATA: { [x: number]: string[] } = {
  1: [
    'Up to 100 Subdomains',
    'Available via all ArNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
  2: [
    'Up to 1,000 Subdomains',
    'Available via all ArNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
  3: [
    'Up to 10,000 Subdomains',
    'Available via all ArNS-enabled gateways',
    'Permanently stored on Arweave',
  ],
};
export const NAME_PRICE_INFO =
  'Registration fees are determined by the character length of the domain, lease duration, and what tier you choose.';

export const MAX_LEASE_DURATION = 200;
export const MIN_LEASE_DURATION = 1;

export const WALLET_PERMISSIONS = [
  'ACCESS_ADDRESS',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ENCRYPT',
  'DECRYPT',
  'ACCESS_ARWEAVE_CONFIG',
];

export const APP_INFO = {
  name: 'ArNS portal - ar.io',
};

export const FUN_FACTS = [
  'There are a total of 40,481,239,792,225,648,784,462,962,746,450 (40 nonillion, 481 octillion, 239 septillion, 792 sextillian, 225 quintillion, 648 quadrillion, 784 trillion, 462 billion, 962 million, 746 thousand, 450) possible names on ArNS.',
  "Arweave transaction ID's consist of 43 alpha numeric characters and underscores or dashes.",
  'ArNS names may consist of up to 32 alpha numeric characters including dashes, but may not begin or end with a dash.',
  'ArFS stands for Arweave File System.',
  'ArNS stands for Arweave Name Service.',
  'TTL stands for Time To Live.',
  'Target ID is the Arweave transaction ID that your ANT directs to when you enter an ArNS name in the browser.',
  'You can register multiple ArNS names to the same ANT, but you cannot register multiple ANTs to the same ArNS name.',
  'When you register multiple ArNS names to the same ANT, and transfer that ANT to another person, they recieve all the ArNS names.',
  'ArNS utilizes the Smartweave Protocol.',
  'Arweave keys are generated using the RSA method.',
  'You can upload files to arweave easily using ardrive.app',
  'Arweave is the only storage chain that gives you free punch and pie.',
  'The smallest denomination of AR is called a winston. Its also the name of the elephant in the top left corner.',
  'Why an elephant for a logo? Im so glad you asked, its because elephants never forget, and neither does Arweave.',
  'Arweave miners and gateways use a software called Shepherd to ensure illegal content is not stored on their nodes. The content deemed illegal can vary from country to country.',
  "Can you send your AR or IO tokens to your ethereum or other blockchain wallet? NO! these are fundamentally incompatible. Don't send your AR tokens to other blockchain addresses or wallets.",
  'ARKB is a CLI tool you can use to deploy your web app to arweave. It creates a manifest.json file with the routes to your files so the browser can access them.',
  'Arweave transactions have a tag space of up to 2kb. You can use the arweave.net/graphql endpoint to search for transactions based on their tags. See gql-guide.arweave.dev for more details.',
  "Permaweb apps are built using normal web technologies — HTML, CSS, and Javascript — but are deployed to Arweave's on-chain storage system, making them permanent and available in a fast, decentralised manner.",
  'PST stands for Profit Sharing Token.',
  "ANS stands for Arweave Network Standard. It is the Arweave equivelant of Ethereum's ERC or EIP standards.",
  'Arweave has a Layer 1 and Layer 2! Layer 1 transactions are transactions deployed directly to nodes, whereas Layer 2 transactions have multiple BUNDLED transactions in them, sometimes tens of thousands. They get given to the node as a single Layer 1 transactions and the gateway unpacks them to serve the data! By doing this Arweave can scale to hundreds of thousands of transactions per second.',
  'This app will probably self-destruct in 5 seconds.',
  'Bandwidth on Arweave is shared by nodes using the Wildfire protocol.',
  'Penguins lay eggs and are equal or better to platipi.',
  'The speed of light is 299,792,458,000,000,000 nanometres per second.',
  'Some plants are made of wood',
  'Rocks are hard sometimes',
  "Aluminium, has one of the highest strength to weight ratios of all the metals, but it can give you 'heavy metal' poisoning.",
  'When distilling alcohol they heat the distillate at a lower temperature to remove the other dangerous ethers from the liquid before heating it to the alcohols boiling point.',
  "Queen bees only mate once in their entire life. When they first hatch they sting all the other queen cells the workers make to get rid of the competition. They then scream 'VICTORY' and the old queen takes half the workers and leave, kind of like a divorce.",
  'Worker bees control the population of the hive by forcing the queen to lay in certain cells, and can even tell when they need a new queen, and then make different types of cells for those queens. The main difference is they are bigger, and get a higher royal jelly ratio than worker be cells.',
  'Never trust a man who wears gummy bear toe rings.',
  'Poutine is derived from the Poutine tree which only grows in certain parts of intercity areas in Canada, Quebec.',
  'One of the oldest recorded pizza recipes was actually a sweet rosewater bread recipe.',
  'You can use used tires to build houses buy filling them with dirt and compacting it with a sledgehammer, these are called Earthships.',
];
