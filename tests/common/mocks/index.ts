// TODO: figure out where to put hooks mocks
export const setupMocks = () => {
  jest.doMock('@src/hooks', () => ({
    useAuctionInfo: jest.fn(() => ({})),
    useIsFocused: jest.fn(() => false),
    useIsMobile: jest.fn(() => false),
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
      const {
        ArweaveCompositeDataProviderMock,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
      } = require('./ArweaveCompositeDataProviderMock');
      return new ArweaveCompositeDataProviderMock();
    }),
  }));
};

export default { setupMocks };
