import * as Sentry from '@sentry/react';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout, ProtectedRoute } from './components/layout';
import Redirect from './components/layout/Redirect/Redirect';
import Undernames from './components/layout/Undernames/Undernames';
import ViewAuction from './components/layout/ViewAuction/ViewAuction';
import {
  ConnectWalletModal,
  CreatePDNTModal,
  ManagePDNTModal,
} from './components/modals';
import {
  Auctions,
  Home,
  Manage,
  NotFound,
  Register,
  Transaction,
} from './components/pages';
import { usePDNSContract } from './hooks/';
import useArconnectEvents from './hooks/useArconnectEvents/useArconnectEvents';
import './index.css';

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  // dispatches global state
  usePDNSContract();
  useArconnectEvents();

  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route index element={<Home />} />
        <Route path="info" element={<Redirect url="https://ar.io/arns" />} />
        <Route path="connect" element={<ConnectWalletModal />} />
        <Route
          path="create"
          element={
            <ProtectedRoute>
              <CreatePDNTModal />
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
                <ManagePDNTModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="ants/:id/undernames"
            element={
              <ProtectedRoute>
                <Undernames />
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
        ,
        <Route path="auctions" element={<Auctions />} />,
        <Route path="auctions/:name" element={<ViewAuction />} />
        <Route
          path="register/:name"
          element={
            <ProtectedRoute>
              <Register />
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
