import { render, cleanup } from '@testing-library/react';
import NavLink from '../NavLink';

describe('NavLink', () => {
  afterEach(cleanup);

  test('render NavLink', () => {
    render(<NavLink />);
  });
});
