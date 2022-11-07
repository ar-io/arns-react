import { render, cleanup } from '@testing-library/react';
import AvailabilityHeader from '../SearchBarHeader';

describe('AvailabilityHeader', () => {
  afterEach(cleanup);

  test('render AvailabilityHeader', () => {
    render(<AvailabilityHeader availability="search" name="" />);
  });
});
