import { render, cleanup } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', () => {
    render(
      <SearchBar
        searchButtonAction={() => {
          console.log('search');
        }}
      />,
    );
  });
});
