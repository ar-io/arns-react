import { act, cleanup, render } from '@testing-library/react';

import App from './App';

describe('App', () => {
  afterEach(cleanup);

  test('render App', async () => {
    await act(async () => {
      await render(<App />);
    });
  });
});
