import { act, cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import Navbar from '../Navbar';

describe('Navbar', () => {
  afterEach(cleanup);

  test('render Navbar', async () => {
    await act(() =>
      render(
        <Router>
          <Navbar />
        </Router>,
      ),
    );
  });
});
