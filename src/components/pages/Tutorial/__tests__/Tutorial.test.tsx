import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Tutorial from '../Tutorial';

describe('Tutorial', () => {
  afterEach(cleanup);

  test('render Tutorial', () => {
    render(
      <Router>
        <Tutorial />
      </Router>,
    );
  });
});
