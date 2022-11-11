import { cleanup, render } from '@testing-library/react';

import ConnectButton from '../ConnectButton';

describe('ConnectButton', () => {
  afterEach(cleanup);

  test('render ConnectButton', () => {
    render(<ConnectButton />);
  });
});
