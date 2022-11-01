import { render, cleanup } from '@testing-library/react';
import NavGroupRight from '../NavGroupRight';

describe('NavGroupRight', () => {
  afterEach(cleanup);

  test('render NavGroupRight', () => {
    render(
        <NavGroupRight />
    );
  });
});
