import { cleanup, render } from '@testing-library/react';

import CreateAntModal from '../CreateAntModal';

describe('Create', () => {
  afterEach(cleanup);

  test('render Create', () => {
    render(<CreateAntModal />);
  });
});
