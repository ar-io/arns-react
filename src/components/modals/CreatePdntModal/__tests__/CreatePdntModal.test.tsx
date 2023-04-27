import { act, cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import CreatePdntModal from '../CreatePdntModal';

describe('Create', () => {
  afterEach(cleanup);

  test('render Create', async () => {
    await act(async () =>
      render(
        <Router>
          <CreatePdntModal />
        </Router>,
      ),
    );
  });
});
