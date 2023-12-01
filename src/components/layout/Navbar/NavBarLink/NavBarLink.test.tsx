import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import NavBarLink from './NavBarLink';

describe('NavLink', () => {
  afterEach(cleanup);

  test('render NavLink', () => {
    render(
      <Router>
        <NavBarLink path="" linkText="" />
      </Router>,
    );
  });
});
