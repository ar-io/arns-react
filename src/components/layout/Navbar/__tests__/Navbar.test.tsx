import { cleanup, render } from '@testing-library/react';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import Navbar from '../Navbar';

describe('Navbar', () => {
  afterEach(cleanup);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Navbar />} errorElement={<div>Not Found</div>} />,
    ),
  );

  test('render Navbar', () => {
    render(
      <>
        <RouterProvider router={router} />
      </>,
    );
  });
});
