import { render, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import FAQ from '../FAQ';

describe('FAQ', () => {
  afterEach(cleanup);

  test('render FAQ', () => {
    render(
      <Router>
        <FAQ />
      </Router>,
    );
  });
});
