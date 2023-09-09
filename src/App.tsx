import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout, ProtectedRoute } from './components/layout';
import { ANT_FLAG } from './components/layout/Breadcrumbs/Breadcrumbs';
import Redirect from './components/layout/Redirect/Redirect';
import Undernames from './components/layout/Undernames/Undernames';
import UpgradeUndernames from './components/layout/UpgradeUndernames/UpgradeUndernames';
import ViewAuction from './components/layout/ViewAuction/ViewAuction';
import {
  ConnectWalletModal,
  CreatePDNTModal,
  ManagePDNTModal,
} from './components/modals';
import ManageDomainModal from './components/modals/ManageDomainModal/ManageDomainModal';
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
import { useGlobalState } from './state/contexts/GlobalState';

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  // dispatches global state
  usePDNSContract();
  const [, dispatchGlobalState] = useGlobalState();
  const arconnectEvents = useArconnectEvents();

  useEffect(() => {
    if (arconnectEvents) {
      arconnectEvents.on('gateway', (e: any) => {
        dispatchGlobalState({
          type: 'setGateway',
          payload: e.host,
        });
      });
    }
  }, [arconnectEvents]);

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
            handle={{
              crumbs: (data: string) => [
                { name: 'Manage Assets', route: '/manage/ants' },
                {
                  name: ANT_FLAG,
                  route: `/manage/ants/${data}`,
                },
              ],
            }}
          />
          <Route
            path="ants/:id/undernames"
            element={
              <ProtectedRoute>
                <Undernames />
              </ProtectedRoute>
            }
            handle={{
              crumbs: (data: string) => [
                { name: 'Manage Assets', route: '/manage/ants' },
                {
                  name: ANT_FLAG,
                  route: `/manage/ants/${data}`,
                },
                {
                  name: 'Manage Undernames',
                  route: `/manage/ants/${data}/undernames`,
                },
              ],
            }}
          />
          {/* TODO: create manage name modal and add here */}
          <Route
            path="names/:name"
            element={
              <ProtectedRoute>
                <ManageDomainModal />
              </ProtectedRoute>
            }
            handle={{
              crumbs: (data: string) => [
                { name: 'Manage Assets', route: '/manage/names' },
                { name: data, route: `/manage/names/${data}` },
              ],
            }}
          />
          <Route
            path="names/:name/undernames"
            element={
              <ProtectedRoute>
                <UpgradeUndernames />
              </ProtectedRoute>
            }
            handle={{
              crumbs: (data: string) => [
                { name: 'Manage Assets', route: '/manage/names' },
                { name: data, route: `/manage/names/${data}` },
                {
                  name: 'Increase Undernames',
                  route: `/manage/names/${data}/undernames`,
                },
              ],
            }}
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
