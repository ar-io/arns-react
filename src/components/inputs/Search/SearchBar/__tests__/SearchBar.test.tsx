import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter as Router } from 'react-router-dom';

import { TRANSACTION_TYPES } from '../../../../../types';
import { lowerCaseDomain } from '../../../../../utils';
import SearchBar from '../SearchBar';

jest.mock('../../../../../hooks', () => ({
  useAuctionInfo: jest.fn(() => ({})),
  useIsFocused: jest.fn(() => false),
  useIsMobile: jest.fn(() => false),
  useWalletAddress: jest.fn(() => ({
    walletAddress: undefined,
    wallet: undefined,
  })),
  useRegistrationStatus: jest.fn(() => [
    {
      isAvailable: false,
      isAuction: false,
      isReserved: false,
      loading: false,
    },
  ]),
}));

const TEST_RECORDS = {
  ardrive: {
    contractTxId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    endTimestamp: 1711122739,
    tier: 'SEC0-8cTfyDBRQo21KNIhUV5KreuEmIY05wX-VOeESE',
    type: TRANSACTION_TYPES.BUY,
  },
  'xn--go8h6v': {
    contractTxId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    endTimestamp: 1711122739,
    tier: 'SEC0-8cTfyDBRQo21KNIhUV5KreuEmIY05wX-VOeESE',
    type: TRANSACTION_TYPES.LEASE,
  },
};

describe('SearchBar', () => {
  let searchInput: HTMLInputElement;
  let searchButton: HTMLButtonElement;
  let renderSearchBar: any;

  const onChange = jest.fn();
  const onSubmit = jest.fn();
  const onFailure = jest.fn();
  const onSuccess = jest.fn();
  const successPredicate = jest.fn().mockReturnValue(true);
  const validationPredicate = jest.fn().mockReturnValue(true);
  const searchBar = (
    <Router>
      <SearchBar
        onSubmit={onSubmit}
        onChange={onChange}
        onFailure={onFailure}
        onSuccess={onSuccess}
        successPredicate={successPredicate}
        validationPredicate={validationPredicate}
        value=""
        values={TEST_RECORDS}
        placeholderText={'Find a name'}
        headerElement={<></>}
        footerElement={<></>}
      />
      ,
    </Router>
  );

  beforeEach(() => {
    const { asFragment, getByTestId } = render(searchBar);
    renderSearchBar = asFragment;
    searchInput = getByTestId('searchbar-input-id') as HTMLInputElement;
    searchButton = getByTestId('search-button') as HTMLButtonElement;
  });

  afterEach(cleanup);

  test('renders correctly', () => {
    expect(renderSearchBar()).toMatchSnapshot();
  });

  test('handles a capitalized name correctly', async () => {
    const domain = 'ARDRIVE';

    await userEvent.type(searchInput, domain);
    await userEvent.click(searchButton);

    expect(onChange).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    expect(onFailure).not.toHaveBeenCalled();
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    expect(renderSearchBar()).toMatchSnapshot();
  });

  test('handles a lowercase name correctly', async () => {
    const domain = 'ardrive';

    await userEvent.type(searchInput, domain);
    await userEvent.click(searchButton);
    expect(onChange).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    expect(onFailure).not.toHaveBeenCalled();
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    expect(renderSearchBar()).toMatchSnapshot();
  });

  // additional tests to be added here
});
