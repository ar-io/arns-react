import { render, cleanup } from '@testing-library/react';
import SearchBarHome from '../SearchBarHome';

describe('SearchBarHome', () => {
  afterEach(cleanup);

  test('render SearchBarHome', () => {
    render(
      <SearchBarHome
        searchButtonAction={() => {
          console.log('search');
        }}
      />,
    );
  });
});
