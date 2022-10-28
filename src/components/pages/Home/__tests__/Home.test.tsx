import React from 'react';
import { render, fireEvent, cleanup } from 'test-utils';
import '@testing-library/jest-dom';
import Home from '../Home';

afterEach(cleanup);

test('render Home', () => {
  render(<Home />);
});
