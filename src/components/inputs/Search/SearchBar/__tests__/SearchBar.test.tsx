import { render, cleanup } from '@testing-library/react';
import SearchBar from '../SearchBar';
import SearchBarHeader from '../../../../layout/SearchBarHeader/SearchBarHeader';

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', () => {
    const stub = jest.fn();
    render(
      <SearchBar
        predicate={stub}
        values={[]}
        placeholderText={'Find a name'}
        headerElement={<SearchBarHeader defaultText="Find a name" />}
        footerText={
          'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
        }
      />,
    );
  });
});
