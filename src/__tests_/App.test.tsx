import React from 'react';
import { render, fireEvent, cleanup } from 'test-utils';
import '@testing-library/jest-dom';
import App from '../App';

afterEach(cleanup);

test('render App', () => {
  render(<App />);
});
