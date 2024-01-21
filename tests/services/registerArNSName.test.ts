import { ANTContract } from '../../src/services/arweave/ANTContract';
import { ARNSContractCache } from '../../src/services/arweave/ARNSContractCache';
import { ArweaveCompositeDataProvider } from '../../src/services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '../../src/services/arweave/ArweaveTransactionID';
import { WarpDataProvider } from '../../src/services/arweave/WarpDataProvider';
import { JsonWalletConnector } from '../../src/services/wallets/JsonWalletConnector';
import {
  ANTContractJSON,
  ArweaveWalletConnector,
  TRANSACTION_TYPES,
} from '../../src/types';
import {
  ARNS_SERVICE_API,
  DEFAULT_ANT_CONTRACT_STATE,
} from '../../src/utils/constants';
import {
  addFunds,
  arweave,
  createLocalWallet,
  deployARNSContract,
  mineBlock,
  simpleArweaveProvider,
  warp,
} from '../common/utils/helper';

describe('Register ARNS Name', () => {
  let arnsContractId: string;
  let provider: ArweaveCompositeDataProvider;
  let signer: ArweaveWalletConnector;

  beforeAll(async () => {
    // create composite data provider
    const { wallet, address: owner } = await createLocalWallet(arweave);

    const walletConnector = new JsonWalletConnector(wallet, arweave);

    const arweavedataProvider = new ArweaveCompositeDataProvider(
      simpleArweaveProvider,
      new WarpDataProvider(arweave, walletConnector),
      new ARNSContractCache({
        url: ARNS_SERVICE_API,
        arweave: simpleArweaveProvider,
      }),
    );

    // add funds to wallet
    await addFunds(arweave, wallet);

    // deploy registry contract
    const contractTxId = await deployARNSContract({
      owner,
      wallet,
      provider: arweavedataProvider,
      balances: { [owner]: 1000000000000 },
    });
    arnsContractId = contractTxId;
    provider = arweavedataProvider;
    signer = walletConnector;
  });

  it('should register arns name and deploy a valid contract', async () => {
    const domain = ''.padEnd(40, 'a');

    const initialState: ANTContractJSON = {
      ...DEFAULT_ANT_CONTRACT_STATE,
      owner: (await signer.getWalletAddress()).toString(),
      balances: {
        [(await signer.getWalletAddress()).toString()]: 1,
      },
    };

    const antRegistrationId = await provider.registerAtomicName({
      walletAddress: await signer.getWalletAddress(),
      registryId: new ArweaveTransactionID(arnsContractId),
      srcCodeTransactionId: new ArweaveTransactionID(
        process.env.ANT_CONTRACT_SRC_ID as any,
      ),
      initialState,
      domain,
      type: TRANSACTION_TYPES.BUY,
      auction: false,
      isBid: false,
    });
    await mineBlock(arweave);
    const antState = await arweave.transactions
      // eslint-disable-next-line
      .getData(antRegistrationId!, {
        decode: true,
        string: true,
      })
      .then((data) => JSON.parse(data.toString()));
    const contract = new ANTContract(antState);

    const arns = warp.contract<any>(arnsContractId);
    const {
      cachedValue: { state: arnsState },
    } = await arns.readState();

    expect(antRegistrationId).toBeDefined();
    expect(antState).toBeDefined();
    expect(contract.isValid()).toBeTruthy();
    expect(arnsState.records[domain]).toBeDefined();
    expect(arnsState.records[domain].contractTxId).toEqual(antRegistrationId);
    expect(arnsState.records[domain].type).toEqual(TRANSACTION_TYPES.BUY);
  });

  // TODO: add tests for auctions, lease extension, and undername increase
});
