import { cleanup, render } from '@testing-library/react';

import { SearchBarFooter, SearchBarHeader } from '../../../../layout';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', () => {
    const stub = jest.fn();
    render(
      <SearchBar
        setIsSearching={stub}
        successPredicate={stub}
        validationPredicate={stub}
        values={{}}
        placeholderText={'Find a name'}
        headerElement={<SearchBarHeader defaultText="Find a name" />}
        footerElement={
          <SearchBarFooter
            defaultText={
              'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
            }
          />
        }
      />,
    );
  });
});
