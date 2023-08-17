import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import { PDNSContractCache } from '../../../../services/arweave/PDNSContractCache';
import { ArweaveTransactionID } from '../../../../types';
import { DEFAULT_PDNT_CONTRACT_STATE } from '../../../../utils/constants';
import Home from '../Home';

describe('Home', () => {
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

  test('render Home', () => {
    render(
      <Router>
        <Home />
      </Router>,
    );
  });
});
