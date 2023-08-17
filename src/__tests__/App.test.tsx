import { act, cleanup, render } from '@testing-library/react';

import App from '../App';

// TODO: add mock implementations to return various contract states
jest.mock('../hooks', () => ({
  usePDNSContract: jest.fn(),
  useArweave: jest.fn(),
  useWalletAddress: jest
    .fn()
    .mockReturnValue({ wallet: undefined, walletAddress: undefined }),
  useIsMobile: jest.fn(),
}));
jest.mock('../services/arweave/ArweaveCompositeDataProvider', () => ({
  ArweaveCompositeDataProvider: jest.fn(() => ({
    getCurrentBlockHeight: jest.fn(async () => 1711122739),
    getContractState: jest.fn(async () => ({})),
    isDomainAvailable: jest.fn(async () => true),
    isDomainReserved: jest.fn(async () => false),
    isDomainInAuction: jest.fn(async () => false),
  })),
}));

describe('App', () => {
  afterEach(cleanup);

  test('render App', async () => {
    await act(() => {
      render(<App />);
    });
  });
});
