import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { TRANSACTION_TYPES } from '../../../../../types';
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

describe('SearchBar', () => {
  afterEach(cleanup);

  jest.mock(
    '../../../../../hooks/useRegistrationStatus/useRegistrationStatus',
    () => ({
      useRegistrationStatus: jest.fn(() => ({
        isDomainAvailable: false,
        isDomainInvalid: false,
        isDomainReserved: false,
      })),
    }),
  );

  jest.mock('../../../../../hooks/useAuctionInfo/useAuctionInfo', () => ({
    useAuctionInfo: jest.fn(() => ({})),
  }));

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

  const tree = renderer.create(searchBar).toJSON();
  expect(tree).toMatchSnapshot();

  const { getByTestId } = render(searchBar);
  const searchInput = getByTestId('searchbar-input-id');
  const searchButton = getByTestId('search-button'); // Assuming you used data-testid="search-button"

  test('handles a capitalized name correctly', async () => {
    const domain = 'ARDRIVE';

    await userEvent.type(searchInput, domain);
    expect(onChange).toHaveBeenCalledWith();
    await userEvent.click(searchButton);
    expect(onSubmit).toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalled();
    // Additional assertions as needed...
  });

  test('handles a lowercase name correctly', async () => {
    const domain = 'ardrive';

    await userEvent.type(searchInput, domain);
    await userEvent.click(searchButton);

    expect(onSubmit).toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalled();
  });
});
