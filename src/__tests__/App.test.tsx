import { cleanup, render } from '@testing-library/react';

import App from '../App';

describe('App', () => {
  afterEach(cleanup);

  test('render App', () => {
    render(<App />);
  });
});
