import React from 'react';
import { render, fireEvent, cleanup } from 'test-utils';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';

afterEach(cleanup);

test('render App', () => {
  render(<Navbar />);
});
