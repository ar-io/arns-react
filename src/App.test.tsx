import { act, cleanup, render } from '@testing-library/react';

import App from './App';

jest.mock('./services/arweave/ArweaveCompositeDataProvider', () => {
  const {
    ArweaveCompositeDataProviderMock,
  } = require('./__mocks__/ArweaveCompositeDataProviderMock'); // eslint-disable-line

  return {
    ArweaveCompositeDataProvider: jest.fn().mockImplementation(() => {
      return new ArweaveCompositeDataProviderMock();
    }),
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

describe('App', () => {
  afterEach(cleanup);

  test('render App', async () => {
    await act(async () => {
      await render(<App />);
    });
  });
});
