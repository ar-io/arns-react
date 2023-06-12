import { cleanup, render } from '@testing-library/react';
import { HashRouter as Router } from 'react-router-dom';

import { SearchBarFooter, SearchBarHeader } from '../../../../layout';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', () => {
    const stub = jest.fn();
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
    );
  });
});
