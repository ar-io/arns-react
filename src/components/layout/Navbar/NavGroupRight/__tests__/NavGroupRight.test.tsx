import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavGroupRight from '../NavGroupRight';

describe('NavGroupRight', () => {
  afterEach(cleanup);

  test('render NavGroupRight', () => {
    render(
      <Router>
        <NavGroupRight />
      </Router>,
    );
  });
});
