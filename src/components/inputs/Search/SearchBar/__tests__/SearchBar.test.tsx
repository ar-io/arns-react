import { act, cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Arweave from 'arweave';
import { HashRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { PDNSContractCache } from '../../../../../services/arweave/PDNSContractCache';
import { WarpDataProvider } from '../../../../../services/arweave/WarpDataProvider';
import { ArweaveTransactionID, TRANSACTION_TYPES } from '../../../../../types';
import { DEFAULT_PDNT_CONTRACT_STATE } from '../../../../../utils/constants';
import { SearchBarFooter, SearchBarHeader } from '../../../../layout';
import {
  searchBarSuccessPredicate,
  searchBarValidationPredicate,
} from '../../../../pages/Home/Home';
import SearchBar from '../SearchBar';

Object.defineProperty(global.performance, 'markResourceTiming', {
  value: jest.fn(),
  writable: true,
});

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

jest.mock('../../../../../hooks', () => ({
  useAuctionInfo: jest.fn(() => ({})),
  useIsFocused: jest.fn(() => ({})),
  useIsMobile: jest.fn(() => false),
  useArweaveCompositeProvider: jest.fn(),
  useWalletAddress: jest.fn(() => ({
    walletAddress: undefined,
    wallet: undefined,
  })),
  useRegistrationStatus: jest.fn(() => ({
    isDomainAvailable: false,
    isDomainInvalid: false,
    isDomainReserved: false,
  })),
}));

jest.mock('../../../../../state/contexts/GlobalState', () => ({
  useGlobalState: jest.fn(() => [
    {
      gateway: 'https://arweave.net',
      blockHeight: 1711122739,
      pdnsSourceContract: {},
    },
  ]),
}));

describe('SearchBar', () => {
  afterEach(cleanup);

  //const cache = new PDNSContractCache('some_url');

  // Spy on the methods and provide mock implementations
  // jest
  //   .spyOn(cache, 'getContractState')
  //   // eslint-disable-next-line
  //   .mockImplementation(async (id: ArweaveTransactionID) => {
  //     return DEFAULT_PDNT_CONTRACT_STATE;
  //   });

  // const arweave = Arweave.init({});

  // const warp = new WarpDataProvider(arweave);

  // // Spy on the methods and provide mock implementations
  // jest
  //   .spyOn(warp, 'getContractState')
  //   // eslint-disable-next-line
  //   .mockImplementation(async (id: ArweaveTransactionID) => {
  //     return DEFAULT_PDNT_CONTRACT_STATE;
  //   });

  const onChange = jest.fn();
  const onSubmit = jest.fn();
  const onFailure = jest.fn();
  const onSuccess = jest.fn();

  const searchBar = (
    <Router>
      <SearchBar
        onSubmit={onSubmit}
        onChange={onChange}
        onFailure={onFailure}
        onSuccess={onSuccess}
        successPredicate={(value: string | undefined) =>
          searchBarSuccessPredicate({ value, records: TEST_RECORDS })
        }
        validationPredicate={(value: string | undefined) =>
          searchBarValidationPredicate({ value })
        }
        value=""
        values={TEST_RECORDS}
        placeholderText={'Find a name'}
        headerElement={
          <SearchBarHeader defaultText="Find a name" reservedList={[]} />
        }
        footerElement={<SearchBarFooter isAuction={false} reservedList={[]} />}
      />
    </Router>
  );

  const { getByTestId } = render(searchBar);
  const searchInput = getByTestId('searchbar-input-id');
  const searchButton = getByTestId('search-button'); // Assuming you used data-testid="search-button"

  test('handles a capitalized name correctly', async () => {
    const domain = 'ARDRIVE';

    act(async () => {
      await userEvent.type(searchInput, domain);
      expect(onChange).toHaveBeenCalledWith();
      await userEvent.click(searchButton);

      expect(onSubmit).toHaveBeenCalled();
      expect(onFailure).toHaveBeenCalled();
    });
    const search = renderer
      .create(
        <Router>
          <SearchBar
            onSubmit={onSubmit}
            onChange={onChange}
            onFailure={onFailure}
            onSuccess={onSuccess}
            successPredicate={(value: string | undefined) =>
              searchBarSuccessPredicate({ value, records: TEST_RECORDS })
            }
            validationPredicate={(value: string | undefined) =>
              searchBarValidationPredicate({ value })
            }
            value={domain}
            values={TEST_RECORDS}
            placeholderText={'Find a name'}
            headerElement={
              <SearchBarHeader defaultText="Find a name" reservedList={[]} />
            }
            footerElement={
              <SearchBarFooter isAuction={false} reservedList={[]} />
            }
          />
        </Router>,
      )
      .toJSON();

    expect(search).toMatchSnapshot();
  });

  test('handles a lowercase name correctly', async () => {
    const domain = 'ardrive';

    act(async () => {
      await userEvent.type(searchInput, domain);
      await userEvent.click(searchButton);
      expect(onSubmit).toHaveBeenCalled();
      expect(onFailure).toHaveBeenCalled();
    });

    const search = renderer
      .create(
        <Router>
          <SearchBar
            onSubmit={onSubmit}
            onChange={onChange}
            onFailure={onFailure}
            onSuccess={onSuccess}
            successPredicate={(value: string | undefined) =>
              searchBarSuccessPredicate({ value, records: TEST_RECORDS })
            }
            validationPredicate={(value: string | undefined) =>
              searchBarValidationPredicate({ value })
            }
            value={domain}
            values={TEST_RECORDS}
            placeholderText={'Find a name'}
            headerElement={
              <SearchBarHeader defaultText="Find a name" reservedList={[]} />
            }
            footerElement={
              <SearchBarFooter isAuction={false} reservedList={[]} />
            }
          />
        </Router>,
      )
      .toJSON();

    expect(search).toMatchSnapshot();
  });
});
