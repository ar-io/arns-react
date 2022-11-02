import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import NavBarLink from '../NavBarLink';

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
