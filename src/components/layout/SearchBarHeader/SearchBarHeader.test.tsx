import { cleanup, render } from '@testing-library/react';

import SearchBarHeader from './SearchBarHeader';

describe('SearchBarHeader', () => {
  afterEach(cleanup);

  test('render SearchBarHeader', () => {
    render(
      <SearchBarHeader
        defaultText="Example header"
        isActiveAuction={false}
        isAvailable={false}
        isReserved={false}
      />,
    );
  });
});
