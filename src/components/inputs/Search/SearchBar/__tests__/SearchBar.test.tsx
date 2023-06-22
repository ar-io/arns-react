import { act, cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import { SearchBarFooter, SearchBarHeader } from '../../../../layout';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', async () => {
    const stub = jest.fn();
    await act(async () =>
      render(
        <Router>
          <SearchBar
            onSubmit={stub}
            onChange={stub}
            onFailure={stub}
            onSuccess={stub}
            successPredicate={stub}
            validationPredicate={stub}
            values={{}}
            placeholderText={'Find a name'}
            headerElement={<SearchBarHeader defaultText="Find a name" />}
            footerElement={<SearchBarFooter />}
          />
          ,
        </Router>,
      ),
    );
  });
});
