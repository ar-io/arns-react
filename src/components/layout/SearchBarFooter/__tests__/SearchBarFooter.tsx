import { cleanup, render } from '@testing-library/react';

import SearchBarFooter from '../SearchBarFooter';

describe('SearchBarHeader', () => {
  afterEach(cleanup);

  test('render SearchBarHeader', () => {
    render(<SearchBarFooter reservedList={[]} />);
  });
});
