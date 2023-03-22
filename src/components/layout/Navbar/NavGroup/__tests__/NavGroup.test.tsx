import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import NavGroup from '../NavGroup';

describe('NavGroup', () => {
  afterEach(cleanup);

  test('render NavGroup', () => {
    render(
      <Router>
        <NavGroup />
      </Router>,
    );
  });
});
