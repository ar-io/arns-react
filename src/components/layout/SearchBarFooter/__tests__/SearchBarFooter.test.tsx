import { cleanup, render } from '@testing-library/react';

import SearchBarFooter from '../SearchBarFooter';

describe('SearchBarFooter', () => {
  afterEach(cleanup);

  test('render SearchBarFooter', () => {
    render(
      <SearchBarFooter
        isAvailable={false}
        isReserved={false}
        isActiveAuction={true}
      />,
    );
  });
});
