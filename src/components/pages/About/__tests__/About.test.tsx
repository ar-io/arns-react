import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import About from '../About';

describe('About', () => {
  afterEach(cleanup);

  test('render About', () => {
    render(
      <Router>
        <About />
      </Router>,
    );
  });
});
