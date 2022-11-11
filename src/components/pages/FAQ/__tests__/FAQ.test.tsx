import { cleanup, render } from '@testing-library/react';

import FAQ from '../FAQ';

describe('FAQ', () => {
  afterEach(cleanup);

  test('render FAQ', () => {
    render(<FAQ />);
  });
});
