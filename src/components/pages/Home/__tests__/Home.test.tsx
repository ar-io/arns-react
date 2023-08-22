import { act, cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import Home from '../Home';

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
