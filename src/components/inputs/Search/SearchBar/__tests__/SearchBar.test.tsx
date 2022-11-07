import { render, cleanup } from '@testing-library/react';
import SearchBar from '../SearchBar';
import AvailabilityHeader from '../../../../layout/SearchBarHeader/SearchBarHeader'

describe('SearchBar', () => {
  afterEach(cleanup);

  test('render SearchBar', () => {
    const stub = jest.fn();
    const searchName = ""
    const availability = "search" 
    render(
      <SearchBar
        buttonAction={stub}
        placeholderText={searchName}
        headerElement={<AvailabilityHeader isValid={availability} name={searchName}}
        footerText={
          'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
        }
        isValid={availability}
      />,
    );
    it('should not run')
  });
});
