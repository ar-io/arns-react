import * as Sentry from '@sentry/react';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout, ProtectedRoute } from './components/layout';
import {
  ConnectWalletModal,
  CreateAntModal,
  ManageAntModal, // ManageAntModal,
} from './components/modals';
import { About, Home, Manage, NotFound, Transaction } from './components/pages';
import { useArNSContract } from './hooks/';
import './index.css';

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  // dispatches global state
  useArNSContract();

  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route index element={<Home />} />
        <Route path="info" element={<About />} />
        <Route path="connect" element={<ConnectWalletModal />} />
        <Route
          path="create"
          element={
            <ProtectedRoute>
              <CreateAntModal />
            </ProtectedRoute>
          }
        />
        <Route path="manage">
          <Route index={true} element={<Navigate to="names" />} />
          <Route path=":path">
            <Route
              index={true}
              element={
                <ProtectedRoute>
                  <Manage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="ants/:id"
            element={
              <ProtectedRoute>
                <ManageAntModal />
              </ProtectedRoute>
            }
          />
          {/* TODO: create manage name modal and add here */}
          <Route
            path="names/:name"
            element={
              <ProtectedRoute>
                <div
                  className="text-large white center"
                  style={{ margin: '15% 0%' }}
                >
                  Manage Name Modal Coming soon!
                </div>
              </ProtectedRoute>
            }
          />
        </Route>
        ,
        <Route
          path="transaction"
          element={
            <ProtectedRoute>
              <Transaction />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>,
    ),
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
