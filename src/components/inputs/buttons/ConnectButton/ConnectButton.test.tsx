import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import ConnectButton from './ConnectButton';

describe('ConnectButton', () => {
  afterEach(cleanup);

  test('render ConnectButton', () => {
    render(
      <Router>
        <ConnectButton />
      </Router>,
    );
  });
});
