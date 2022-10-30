import { render, cleanup } from '@testing-library/react';
import Navbar from '../Navbar';

describe('Navbar', () => {
  afterEach(cleanup);

  test('render Navbar', () => {
    render(<Navbar />);
  });
});
