import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import Home from './Home';

describe('Home', () => {
  afterEach(cleanup);

  test('render Home', () => {
    render(
      <Router>
        <Home />
      </Router>,
    );
  });
});
