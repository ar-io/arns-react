import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import Navbar from '../Navbar';

describe('Navbar', () => {
  afterEach(cleanup);

  test('render Navbar', () => {
    render(
      <Router>
        <Navbar />
      </Router>,
    );
  });
});
