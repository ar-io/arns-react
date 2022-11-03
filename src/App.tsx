import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import './index.css';
import { About, FAQ, Home } from './components/pages';
import { Layout } from './components/layout';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<FAQ />} />
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
