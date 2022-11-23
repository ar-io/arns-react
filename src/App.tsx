import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout } from './components/layout';
import ConnectWalletModal from './components/modals/ConnectWalletModal/ConnectWalletModal';
import { About, FAQ, Home, Manage, NotFound } from './components/pages';
import { useArNSContract, useConnectWalletModal } from './hooks/';
import './index.css';
import { useStateValue } from './state/state';

function App() {
  // dispatches global state
  useArNSContract();
  const { showConnectModal } = useConnectWalletModal();

  const [{ jwk }] = useStateValue();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<FAQ />} />
        {jwk ? <Route path="manage" element={<Manage />} /> : <></>}
        <Route path="*" element={<NotFound />} />
      </Route>,
    ),
    {
      // TODO: remove this when we're no longer deploying to github pages
      basename: process.env.NODE_ENV !== 'test' ? '/arns-react/' : '/',
    },
  );

  return (
    <>
      <RouterProvider router={router} />
      <ConnectWalletModal show={showConnectModal} />
    </>
  );
}

export default App;
