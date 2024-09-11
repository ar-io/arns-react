import HomeSearch from '@src/components/inputs/Search/HomeSearch';
import { render, screen } from '@testing-library/react';

const registeredDomains = {
  ardrive: {
    processId: 'ardrive-'.padEnd(43, '0'),
    endTimestamp: 123456789,
  },
};

const priceList = {
  lease: 10,
  buy: 10,
};

jest.mock('@src/hooks/useArNSRegistryDomains', () => ({
  useArNSRegistryDomains: () => ({
    data: registeredDomains,
    isLoading: false,
  }),
}));

jest.mock('@src/hooks/useArNSDomainPriceList', () => ({
  useArNSDomainPriceList: () => ({
    data: priceList,
    isLoading: false,
  }),
}));

describe('HomeSearch', () => {
  test('renders the search input', () => {
    render(<HomeSearch />);
    const searchInput = screen.getByTestId('domain-search-input');
    expect(searchInput).toBeDefined();
  });

  test('renders the search button', () => {
    render(<HomeSearch />);
    const searchButton = screen.getByTestId('domain-search-button');
    expect(searchButton).toBeDefined();
  });

  test('renders available header', () => {
    render(<HomeSearch />);
    const searchIcon = screen.getByTestId('domain-search-icon');
    expect(searchIcon).toBeDefined();
  });
});
