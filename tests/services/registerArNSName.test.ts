import { TransactionInterface } from 'arweave/node/lib/transaction';
import Transaction from 'arweave/web/lib/transaction';

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
  ARNS_REGISTRY_ADDRESS,
  ARNS_SERVICE_API,
  DEFAULT_ANT_CONTRACT_STATE,
  DEFAULT_ANT_SOURCE_CODE_TX,
} from '../../src/utils/constants';
import { arweave, simpleArweaveProvider } from '../common/utils/helper';

describe('Register ARNS Name', () => {
  let provider: ArweaveCompositeDataProvider;
  let signer: ArweaveWalletConnector;
  let antState: ANTContractJSON;
  const signerSignMock = jest.fn((t: TransactionInterface) => t);

  beforeAll(async () => {
    // create composite data provider
    const wallet = await arweave.wallets.generate();

    arweave.api.request = jest.fn();
    arweave.transactions.getTransactionAnchor = jest.fn(async () => 'anchor');
    arweave.createTransaction = jest.fn(
      async (props: Partial<TransactionInterface>) => {
        antState = JSON.parse(props.data!.toString());
        return new Transaction({ ...props, id: ''.padEnd(43, 'a') });
      },
    );

    const walletConnector = new JsonWalletConnector(wallet, arweave);

    walletConnector.signer.signer = signerSignMock as any;
    const warpProvider = new WarpDataProvider(arweave, walletConnector);
    warpProvider.dryWrite = jest.fn(async () => ({ type: 'ok' })) as any;

    const arweavedataProvider = new ArweaveCompositeDataProvider(
      simpleArweaveProvider,
      warpProvider,
      new ARNSContractCache({
        url: ARNS_SERVICE_API,
        arweave: simpleArweaveProvider,
      }),
    );

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

    await provider
      .registerAtomicName({
        walletAddress: await signer.getWalletAddress(),
        registryId: ARNS_REGISTRY_ADDRESS,
        srcCodeTransactionId: new ArweaveTransactionID(
          DEFAULT_ANT_SOURCE_CODE_TX,
        ),
        initialState,
        domain,
        type: TRANSACTION_TYPES.BUY,
        auction: false,
        isBid: false,
      })
      .catch(() => null);
    const contract = new ANTContract(antState);

    expect(antState).toBeDefined();
    expect(contract.isValid()).toBeTruthy();
  });

  // TODO: add tests for auctions, lease extension, and undername increase
});
