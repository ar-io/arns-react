import { render, cleanup } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', () => {
   const stub = jest.fn();
    render(
      <SearchBar
        searchButtonAction={stub}
      />,
    );
  });
});
