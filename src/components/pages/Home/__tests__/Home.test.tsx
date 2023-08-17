import { act, cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import Home from '../Home';

jest.mock('../../../../services/arweave/ArweaveCompositeDataProvider', () => ({
  ArweaveCompositeDataProvider: jest.fn(() => ({
    getCurrentBlockHeight: jest.fn(async () => 1711122739),
    getContractState: jest.fn(async () => ({})),
    isDomainAvailable: jest.fn(async () => true),
    isDomainReserved: jest.fn(async () => false),
    isDomainInAuction: jest.fn(async () => false),
  })),
}));

describe('Home', () => {
  afterEach(cleanup);

  test('render Home', async () => {
    await act(() =>
      render(
        <Router>
          <Home />
        </Router>,
      ),
    );
  });
});
