import { queryClient } from '@src/utils/network';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import NavGroup from './NavGroup';

describe('NavGroup', () => {
  afterEach(cleanup);

  test('render NavGroup', async () => {
    await act(() =>
      render(
        <QueryClientProvider client={queryClient}>
          <Router>
            <NavGroup />
          </Router>
        </QueryClientProvider>,
      ),
    );
  });
});
