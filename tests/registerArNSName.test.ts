import { ARNSContractCache } from '@src/services/arweave/ARNSContractCache';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { WarpDataProvider } from '@src/services/arweave/WarpDataProvider';
import { JsonWalletConnector } from '@src/services/wallets/JsonWalletConnector';
import { ARNS_SERVICE_API } from '@src/utils/constants';

import {
  addFunds,
  arlocal,
  arweave,
  createLocalWallet,
  deployARNSContract,
  simpleArweaveProvider,
  warp,
} from './common/utils/helper';

describe('Register ARNS Name', () => {
  beforeAll(async () => {
    // create composite data provider
    const { wallet, address: owner } = await createLocalWallet(arweave);

    const arweavedataProvider = new ArweaveCompositeDataProvider(
      simpleArweaveProvider,
      new WarpDataProvider(arweave, new JsonWalletConnector(wallet, arweave)),
      new ARNSContractCache({
        url: ARNS_SERVICE_API,
        arweave: simpleArweaveProvider,
      }),
    );

    // add funds to wallet
    await addFunds(arweave, wallet);

    // deploy registry contract
    await deployARNSContract(wallet, arweavedataProvider);
  });

  it('should deploy ARNS contract', async () => {
    expect(contractTxId).toBeDefined();
  });
});
