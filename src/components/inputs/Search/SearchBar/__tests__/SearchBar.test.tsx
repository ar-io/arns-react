import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArweaveCompositeDataProviderMock } from '../../../../../__tests__/__mocks__/ArweaveCompositeDataProviderMock';
import RegistrationStateProvider, {
  RegistrationState,
} from '../../../../../state/contexts/RegistrationState';
import {
  RegistrationAction,
  registrationReducer,
} from '../../../../../state/reducers';
import {
  ArweaveTransactionID,
  PDNSRecordEntry,
  TRANSACTION_TYPES,
} from '../../../../../types';
import { lowerCaseDomain } from '../../../../../utils';
import SearchBar from '../SearchBar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: '5nvxpbdafa',
  })),
  useNavigate: jest.fn(() => jest.fn()),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock(
  '../../../../../services/arweave/ArweaveCompositeDataProvider',
  () => {
    const {
      ArweaveCompositeDataProviderMock,
    } = require('../../../../../__tests__/__mocks__/ArweaveCompositeDataProviderMock'); // eslint-disable-line

    return {
      ArweaveCompositeDataProvider: jest.fn().mockImplementation(() => {
        return new ArweaveCompositeDataProviderMock();
      }),
    };
  },
);

jest.mock('../../../../../hooks', () => ({
  useAuctionInfo: jest.fn(() => ({})),
  useIsFocused: jest.fn(() => false),
  useIsMobile: jest.fn(() => false),
  useWalletAddress: jest.fn(() => ({
    walletAddress: undefined,
  })),
  useRegistrationState: jest.fn(() => {
    const originalHook = jest.requireActual(
      'path-to-your-hook-file',
    ).useRegistrationState;
    const [state, dispatch] = originalHook();
    return [state, jest.spyOn({ dispatch }, 'dispatch')];
  }),
  useRegistrationStatus: jest.fn(() => ({
    isAvailable: false,
    isAuction: false,
    isReserved: false,
    loading: false,
  })),
  useArweaveCompositeProvider: jest.fn(() => {
    const ArweaveCompositeDataProviderMock =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../../../__tests__/__mocks__/ArweaveCompositeDataProviderMock').ArweaveCompositeDataProviderMock;
    return new ArweaveCompositeDataProviderMock();
  }),
}));

const TEST_RECORDS: Record<string, PDNSRecordEntry> = {
  ardrive: {
    contractTxId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    startTimestamp: 1711122719,
    endTimestamp: 1711122739,
    type: TRANSACTION_TYPES.BUY,
    undernames: 10,
  },
  'xn--go8h6v': {
    contractTxId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
    startTimestamp: 1711122719,
    endTimestamp: 1711122739,
    type: TRANSACTION_TYPES.LEASE,
    undernames: 10,
  },
};

describe('SearchBar', () => {
  let searchInput: HTMLInputElement;
  let searchButton: HTMLButtonElement;
  let renderSearchBar: any;

  const reducer = jest.fn(
    (state: RegistrationState, action: RegistrationAction) => {
      return registrationReducer(state, action);
    },
  );

  const searchBar = (
    <RegistrationStateProvider reducer={reducer}>
      <SearchBar placeholderText={'Find a name'} />
    </RegistrationStateProvider>
  );

  beforeEach(() => {
    const { asFragment, getByTestId } = render(searchBar);
    renderSearchBar = asFragment;
    searchInput = getByTestId('searchbar-input-id') as HTMLInputElement;
    searchButton = getByTestId('search-button') as HTMLButtonElement;
  });

  afterEach(() => {
    cleanup();
  });

  test('renders correctly', () => {
    expect(renderSearchBar()).toMatchSnapshot();
  });

  test('handles a capitalized name correctly', async () => {
    const domain = 'ARDRIVE';

    const mockRecord = TEST_RECORDS['ardrive'];
    const mockGetRecord = jest.fn().mockResolvedValue(mockRecord);

    ArweaveCompositeDataProviderMock.prototype.getRecord = mockGetRecord;

    await userEvent.type(searchInput, domain);
    await userEvent.click(searchButton);

    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'setDomainName',
        payload: domain,
      }),
    );
    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'setANTID',
        payload: new ArweaveTransactionID(TEST_RECORDS['ardrive'].contractTxId),
      }),
    );
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    expect(renderSearchBar()).toMatchSnapshot();
  });

  test('handles a lowercase name correctly', async () => {
    const domain = 'ardrive';

    await userEvent.type(searchInput, domain);
    await userEvent.click(searchButton);

    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'setDomainName',
        payload: 'ardrive',
      }),
    );
    expect(reducer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'setANTID',
        payload: new ArweaveTransactionID(TEST_RECORDS['ardrive'].contractTxId),
      }),
    );
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    expect(renderSearchBar()).toMatchSnapshot();
  });

  // additional tests to be added here
});
