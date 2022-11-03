import { render, cleanup } from '@testing-library/react';
import SearchBarHome from '../SearchBarHome';
import { BrowserRouter as Router } from 'react-router-dom';

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
