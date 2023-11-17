import * as Sentry from '@sentry/react';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout, ProtectedRoute } from './components/layout';
import { ANT_FLAG } from './components/layout/Breadcrumbs/Breadcrumbs';
import ExtendLease from './components/layout/ExtendLease/ExtendLease';
import Redirect from './components/layout/Redirect/Redirect';
import UpgradeUndernames from './components/layout/UpgradeUndernames/UpgradeUndernames';
import ViewAuction from './components/layout/ViewAuction/ViewAuction';
import { ConnectWalletModal } from './components/modals';
import {
  Auctions,
  Home,
  Manage,
  ManageANT,
  ManageDomain,
  NotFound,
  Register,
  Transaction,
  Undernames,
} from './components/pages';
import useArconnectEvents from './hooks/useArconnectEvents/useArconnectEvents';
import './index.css';

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  useArconnectEvents();

  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route index element={<Home />} />
        <Route path="info" element={<Redirect url="https://ar.io/arns" />} />
        <Route path="connect" element={<ConnectWalletModal />} />
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
                <ManageANT />
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
          <Route
            path="names/:name"
            element={
              <ProtectedRoute>
                <ManageDomain />
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
          <Route
            path="names/:name/extend"
            element={
              <ProtectedRoute>
                <ExtendLease />
              </ProtectedRoute>
            }
            handle={{
              crumbs: (data: string) => [
                { name: 'Manage Assets', route: '/manage/names' },
                { name: data, route: `/manage/names/${data}` },
                {
                  name: 'Extend Lease',
                  route: `/manage/names/${data}/extend`,
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
