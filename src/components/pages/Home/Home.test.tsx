import { createIDBPersister, queryClient } from '@src/utils/network';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import Home from './Home';

describe('Home', () => {
  afterEach(cleanup);

  test('render Home', () => {
    render(
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: createIDBPersister(),
        }}
      >
        <Router>
          <Home />
        </Router>
      </PersistQueryClientProvider>,
    );
  });
});
