import { cleanup, render } from '@testing-library/react';

import App from '../App';

// TODO: add mock implementations to return various contract states
jest.mock('../hooks', () => ({
  usePdnsContract: jest.fn(),
  useArweave: jest.fn(),
  useWalletAddress: jest
    .fn()
    .mockReturnValue({ wallet: undefined, walletAddress: undefined }),
  useIsMobile: jest.fn(),
}));

describe('App', () => {
  afterEach(cleanup);

  test('render App', () => {
    render(<App />);
  });
});
