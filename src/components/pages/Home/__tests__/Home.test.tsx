import { cleanup, render } from '@testing-library/react';

import Home from '../Home';

describe('Home', () => {
  afterEach(cleanup);

  test('render Home', () => {
    render(<Home />);
  });
});
