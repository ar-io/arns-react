import { render, cleanup } from '@testing-library/react';
import SearchBarFooter from '../SearchBarFooter';

describe('SearchBarFooter', () => {
  afterEach(cleanup);

  test('render SearchBarFooter', () => {
    render(<SearchBarFooter defaultText="Example header" />);
  });
});
