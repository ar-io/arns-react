import HomeSearch from '@src/components/inputs/Search/HomeSearch';
import { decodeDomainToASCII, lowerCaseDomain } from '@src/utils';
import { queryClient } from '@src/utils/network';
import { QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

jest.mock('@src/hooks/useArNSRegistryDomains', () => ({
  useArNSRegistryDomains: jest.fn().mockReturnValue({
    data: {
      ardrive: {
        processId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
        startTimestamp: 1711122719,
        type: 'permabuy',
        undernameLimit: 10,
        purchasePrice: 0,
      },
      'xn--go8h6v': {
        processId: 'I-cxQhfh0Zb9UqQNizC9PiLC41KpUeA9hjiVV02rQRw',
        startTimestamp: 1711122719,
        type: 'lease',
        undernameLimit: 10,
        purchasePrice: 0,
      },
    },
    isLoading: false,
  }),
}));

describe('HomeSearch', () => {
  let searchInput: HTMLInputElement;
  // let renderSearchBar: any;
  const searchBar = (
    <QueryClientProvider client={queryClient}>
      <HomeSearch />
    </QueryClientProvider>
  );

  beforeEach(async () => {
    const { getByTestId } = await act(async () => await render(searchBar));
    // renderSearchBar = asFragment;
    searchInput = getByTestId('domain-search-input') as HTMLInputElement;
  });

  afterEach(cleanup);

  // test('renders correctly', () => {
  //   // expect(renderSearchBar()).toMatchSnapshot();
  // });

  test('handles a capitalized name correctly', async () => {
    const domain = 'ARDRIVE';

    await userEvent.type(searchInput, domain);
    // debounce time
    await new Promise((resolve) => setTimeout(resolve, 4000));
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    // expect(renderSearchBar()).toMatchSnapshot();
  });

  test('handles a lowercase name correctly', async () => {
    const domain = 'ardrive';

    await userEvent.type(searchInput, domain);

    // debounce time
    await new Promise((resolve) => setTimeout(resolve, 4000));
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    // expect(renderSearchBar()).toMatchSnapshot();
  });

  test('handles a emoji name correctly', async () => {
    const domain = 'xn--go8h6v';

    await userEvent.type(searchInput, decodeDomainToASCII(domain));
    // debounce time
    await new Promise((resolve) => setTimeout(resolve, 4000));
    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    // expect(renderSearchBar()).toMatchSnapshot();
  });

  test('renders available header', async () => {
    const domain = 'available-domain';

    await userEvent.type(searchInput, domain);

    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    // expect(renderSearchBar()).toMatchSnapshot();

    // debounce time
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const availableHeader = screen.getByTestId('home-search-available-header');
    expect(availableHeader).toBeDefined();
  });

  test('renders unavailable header', async () => {
    const domain = 'ardrive';

    await userEvent.type(searchInput, domain);

    expect(lowerCaseDomain(searchInput.value)).toEqual(lowerCaseDomain(domain));
    // expect(renderSearchBar()).toMatchSnapshot();
    // debounce time
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const unavailableHeader = screen.getByTestId('home-search-spacer-header');
    expect(unavailableHeader).toBeDefined();
  });

  it.each(['ardrive-', 'ardrive.d', 'ard?drive', 'ar_drive'])(
    'renders invalid domain header',
    async (domain) => {
      await userEvent.type(searchInput, domain);

      expect(lowerCaseDomain(searchInput.value)).toEqual(
        lowerCaseDomain(domain),
      );
      // expect(renderSearchBar()).toMatchSnapshot();
      // debounce time
      await new Promise((resolve) => setTimeout(resolve, 4000));
      const invalidHeader = screen.getByTestId('home-search-invalid-header');
      expect(invalidHeader).toBeDefined();
    },
  );
});
