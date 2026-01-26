import { cleanup, render } from '@testing-library/react';

import ValidationInput from './ValidationInput';

describe('ValidationInput', () => {
  let renderInput: any;

  const setValue = jest.fn();
  const validationInput = (
    <ValidationInput
      value=""
      inputId="test-input-id"
      placeholder={'Test input'}
      setValue={setValue}
    />
  );

  beforeEach(() => {
    const { asFragment } = render(validationInput);
    renderInput = asFragment;
  });

  afterEach(cleanup);

  test('renders correctly', () => {
    expect(renderInput()).toMatchSnapshot();
  });

  // tests specific to validation input
});
