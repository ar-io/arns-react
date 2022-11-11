import { cleanup, render } from '@testing-library/react';

import SearchBarHeader from '../SearchBarFooter';

describe('SearchBarHeader', () => {
  afterEach(cleanup);

  test('render SearchBarHeader', () => {
    render(<SearchBarHeader defaultText="Example header" />);
  });
});
