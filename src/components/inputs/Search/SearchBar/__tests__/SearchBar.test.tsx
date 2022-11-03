import { render, cleanup } from '@testing-library/react';
import SearchBar from '../SearchBar';
import { BrowserRouter as Router } from 'react-router-dom';

describe('SearchBarHome', () => {
  afterEach(cleanup);

  test('render SearchBarHome', () => {
    render(
      <SearchBar
        searchButtonAction={() => {
          console.log('search');
        }}
      />,
    );
  });
});
