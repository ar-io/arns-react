import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout } from './components/layout';
import { About, FAQ, Home, Manage, NotFound } from './components/pages';
import { useArNSContract } from './hooks/';
import './index.css';
import { useStateValue } from './state/state.js';

function App() {
  // dispatches global state
  useArNSContract();

  const [{ jwk }] = useStateValue();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<FAQ />} />
        {jwk ? <Route path="manage" element={<Manage />} /> : <></>}
      </Route>,
    ),
    {
      // TODO: remove this when we're no longer deploying to github pages
      basename: process.env.NODE_ENV !== 'test' ? '/arns-react/' : '/',
    },
  );

  return <RouterProvider router={router} />;
}

export default App;
