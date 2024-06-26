import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import GlobalStateProvider from '@src/state/contexts/GlobalState';
import { reducer as globalReducer } from '@src/state/reducers/GlobalReducer';
import { createIDBPersister, queryClient } from '@src/utils/network';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TEST_RECORDS from '@tests/common/fixtures/TestRecords';
import ArweaveCompositeDataProviderMock from '@tests/common/mocks/ArweaveCompositeDataProviderMock';

import RegistrationStateProvider, {
  RegistrationState,
} from '../../../../state/contexts/RegistrationState';
import {
  RegistrationAction,
  registrationReducer,
} from '../../../../state/reducers';
import { lowerCaseDomain } from '../../../../utils';
import SearchBar from './SearchBar';

const providerMock = new ArweaveCompositeDataProviderMock();

providerMock.getRecord.mockReturnValue(
  Promise.resolve(TEST_RECORDS['ardrive']),
);

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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createIDBPersister(),
      }}
    >
      <GlobalStateProvider
        reducer={globalReducer}
        arweaveDataProvider={
          providerMock as unknown as ArweaveCompositeDataProvider
        }
      >
        <RegistrationStateProvider reducer={reducer}>
          <SearchBar placeholderText={'Find a name'} />
        </RegistrationStateProvider>
      </GlobalStateProvider>
    </PersistQueryClientProvider>
  );

  beforeEach(async () => {
    const { asFragment, getByTestId } = await act(
      async () => await render(searchBar),
    );
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

    // expect(reducer).toHaveBeenCalledWith(
    //   expect.anything(),
    //   expect.objectContaining({
    //     type: 'setDomainName',
    //     payload: domain,
    //   }),
    // );
    // expect(reducer).toHaveBeenCalledWith(
    //   expect.anything(),
    //   expect.objectContaining({
    //     type: 'setANTID',
    //     payload: new ArweaveTransactionID(TEST_RECORDS['ardrive'].processId),
    //   }),
    // );
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    expect(renderSearchBar()).toMatchSnapshot();
  });

  test('handles a lowercase name correctly', async () => {
    const domain = 'ardrive';

    await userEvent.type(searchInput, domain);
    await userEvent.click(searchButton);

    // expect(reducer).toHaveBeenCalledWith(
    //   expect.anything(),
    //   expect.objectContaining({
    //     type: 'setDomainName',
    //     payload: 'ardrive',
    //   }),
    // );
    // expect(reducer).toHaveBeenCalledWith(
    //   expect.anything(),
    //   expect.objectContaining({
    //     type: 'setANTID',
    //     payload: new ArweaveTransactionID(TEST_RECORDS['ardrive'].processId),
    //   }),
    // );
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    expect(renderSearchBar()).toMatchSnapshot();
  });

  // additional tests to be added here
});
