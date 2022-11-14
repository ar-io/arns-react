import { cleanup, render } from '@testing-library/react';

import App from '../App';

// TODO: add mock implementations to return various contract states
jest.mock('../hooks');

describe('App', () => {
  afterEach(cleanup);

  test('render App', () => {
    render(<App />);
  });
});
