import { cleanup, render } from '@testing-library/react';

import Create from '../Create';

describe('Create', () => {
  afterEach(cleanup);

  test('render Create', () => {
    render(<Create />);
  });
});
