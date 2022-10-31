import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ManageNames from '../ManageNames';

describe('ManageNames', () => {
  afterEach(cleanup);

  test('render ManageNames', () => {
    render(
      <Router>
        <ManageNames />
      </Router>,
    );
  });
});
