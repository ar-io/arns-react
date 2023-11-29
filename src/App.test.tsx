import { act, cleanup, render } from '@testing-library/react';

import App from './App';

jest.mock('@src/services/arweave/ArweaveCompositeDataProvider');

describe('App', () => {
  afterEach(cleanup);

  test('render App', async () => {
    await act(async () => {
      await render(<App />);
    });
  });
});
