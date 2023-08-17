import { cleanup, render } from '@testing-library/react';
import Arweave from 'arweave';

import App from '../App';
import { PDNSContractCache } from '../services/arweave/PDNSContractCache';
import { WarpDataProvider } from '../services/arweave/WarpDataProvider';
import { ArweaveTransactionID } from '../types';
import { DEFAULT_PDNT_CONTRACT_STATE } from '../utils/constants';

// TODO: add mock implementations to return various contract states
jest.mock('../hooks', () => ({
  usePDNSContract: jest.fn(),
  useArweave: jest.fn(),
  useWalletAddress: jest
    .fn()
    .mockReturnValue({ wallet: undefined, walletAddress: undefined }),
  useIsMobile: jest.fn(),
}));

describe('App', () => {
  afterEach(cleanup);

  const cache = new PDNSContractCache('some_url');

  // Spy on the methods and provide mock implementations
  jest
    .spyOn(cache, 'getContractState')
    .mockImplementation(async (id: ArweaveTransactionID) => {
      // eslint-disable-line
      //eslint-disable-line
      return DEFAULT_PDNT_CONTRACT_STATE;
    });

  const arweave = Arweave.init({});

  const warp = new WarpDataProvider(arweave);

  // Spy on the methods and provide mock implementations
  jest
    .spyOn(warp, 'getContractState')
    .mockImplementation(async (id: ArweaveTransactionID) => {
      // eslint-disable-line
      //eslint-disable-line
      return DEFAULT_PDNT_CONTRACT_STATE;
    });

  test('render App', () => {
    render(<App />);
  });
});
