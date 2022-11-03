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
        headerText={'Find a domain name.'}
        footerText={
          'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
        }
      />,
    );
  });
});
