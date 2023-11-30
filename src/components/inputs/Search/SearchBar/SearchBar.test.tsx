import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TEST_RECORDS from '@tests/common/fixtures/TestRecords';

import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import RegistrationStateProvider, {
  RegistrationState,
} from '../../../../state/contexts/RegistrationState';
import {
  RegistrationAction,
  registrationReducer,
} from '../../../../state/reducers';
import { lowerCaseDomain } from '../../../../utils';
import SearchBar from './SearchBar';

jest.mock('@src/services/arweave/ArweaveCompositeDataProvider', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const TEST_RECORDS = require('@tests/common/fixtures/TestRecords') as any;
  return {
    ArweaveCompositeDataProvider: function () {
      return {
        getRecord: async () => {
          return TEST_RECORDS.default['ardrive'];
        },
      };
    },
  };
});

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
