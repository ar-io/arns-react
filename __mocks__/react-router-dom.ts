const mock = {
  __esModule: true,

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
};

// NOTE: `export default mock` does not work, use module.exports instead
// see https://stackoverflow.com/questions/64037162/how-do-i-mock-react-router-dom-using-jest-from-a-mocks-directory
module.exports = mock;
