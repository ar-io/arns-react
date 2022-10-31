import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Register from '../Register';

describe('Register', () => {
  afterEach(cleanup);

  test('render Register', () => {
    render(
      <Router>
        <Register />
      </Router>,
    );
  });
});
