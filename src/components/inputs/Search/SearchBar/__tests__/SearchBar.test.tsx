import { render, cleanup } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', () => {
    const stub = jest.fn();
    render(
      <SearchBar
        buttonAction={stub}
        placeholderText="Enter a name"
        searchState={"stub"}
        searchBarState={"stub"}
        onChangeHandler={stub}
        headerText={''}
        footerText={''}
      />
    );
  });
});
