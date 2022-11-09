import { render, cleanup } from '@testing-library/react';
import ConnectButton from '../ConnectButton';

describe('ConnectButton', () => {
  afterEach(cleanup);

  test('render ConnectButton', () => {
    render(<ConnectButton />);
  });
});
