import * as Sentry from '@sentry/react';
import React, { Suspense } from 'react';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout } from './components/layout';
import { ANT_FLAG } from './components/layout/Breadcrumbs/Breadcrumbs';
import Redirect from './components/layout/Redirect/Redirect';
import PageLoader from './components/layout/progress/PageLoader/PageLoader';
import useArconnectEvents from './hooks/useArconnectEvents/useArconnectEvents';
import './index.css';

const Home = React.lazy(() => import('./components/pages/Home/Home'));
const Manage = React.lazy(() => import('./components/pages/Manage/Manage'));
const ManageANT = React.lazy(
  () => import('./components/pages/ManageANT/ManageANT'),
);
const ManageDomain = React.lazy(
  () => import('./components/pages/ManageDomain/ManageDomain'),
);
const NotFound = React.lazy(
  () => import('./components/pages/NotFound/NotFound'),
);
const Register = React.lazy(
  () => import('./components/pages/Register/Register'),
);
const TransactionReview = React.lazy(
  () => import('./components/pages/Transaction/TransactionReview'),
);
const TransactionComplete = React.lazy(
  () => import('./components/pages/Transaction/TransactionComplete'),
);
const Undernames = React.lazy(
  () => import('./components/pages/Undernames/Undernames'),
);
// const Auctions = React.lazy(
//   () => import('./components/pages/Auctions/Auctions'),
// );
const ProtectedRoute = React.lazy(
  () => import('./components/layout/ProtectedRoute/ProtectedRoute'),
);
const ConnectWalletModal = React.lazy(
  () => import('./components/modals/ConnectWalletModal/ConnectWalletModal'),
);
const ExtendLease = React.lazy(
  () => import('./components/layout/ExtendLease/ExtendLease'),
);
const UpgradeUndernames = React.lazy(
  () => import('./components/layout/UpgradeUndernames/UpgradeUndernames'),
);
// const ViewAuction = React.lazy(
//   () => import('./components/layout/ViewAuction/ViewAuction'),
// );

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

function App() {
  useArconnectEvents();

  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route
          index
          element={
            <Suspense
              fallback={
                <PageLoader loading={true} message={'Loading, please wait'} />
              }
            >
              <Home />
            </Suspense>
          }
        />
        <Route
          path="connect"
          element={
            <Suspense
              fallback={
                <PageLoader loading={true} message={'Loading, please wait'} />
              }
            >
              <ConnectWalletModal />
            </Suspense>
          }
        />
        <Route path="manage">
          <Route index={true} element={<Navigate to="names" />} />
          <Route path=":path">
            <Route
              index={true}
              element={
                <Suspense
                  fallback={
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  {' '}
                  <ProtectedRoute>
                    <Manage />
                  </ProtectedRoute>
                </Suspense>
              }
            />
          </Route>
          <Route
            path="ants/:id"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                {' '}
                <ProtectedRoute>
                  <ManageANT />
                </ProtectedRoute>
              </Suspense>
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
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                {' '}
                <ProtectedRoute>
                  <Undernames />
                </ProtectedRoute>
              </Suspense>
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
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                {' '}
                <ProtectedRoute>
                  <ManageDomain />
                </ProtectedRoute>
              </Suspense>
            }
            handle={{
              crumbs: (data: string) => [
                { name: 'Manage Assets', route: '/manage/names' },
                { name: data, route: `/manage/names/${data}` },
              ],
            }}
          />
          <Route
            path="names/:name/upgrade-undernames"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                {' '}
                <ProtectedRoute>
                  <UpgradeUndernames />
                </ProtectedRoute>
              </Suspense>
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
            path="names/:name/undernames"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                <ProtectedRoute>
                  <Undernames />
                </ProtectedRoute>
              </Suspense>
            }
            handle={{
              crumbs: (data: string) => [
                { name: 'Manage Assets', route: '/manage/names' },
                {
                  name: ANT_FLAG,
                  route: `/manage/names/${data}`,
                },
                {
                  name: 'Manage Undernames',
                  route: `/manage/names/${data}/undernames`,
                },
              ],
            }}
          />
          <Route
            path="names/:name/extend"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                <ProtectedRoute>
                  <ExtendLease />
                </ProtectedRoute>
              </Suspense>
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
        <Route path="transaction">
          <Route
            path="review"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                <TransactionReview />
              </Suspense>
            }
          />
          <Route
            path="complete"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                <TransactionComplete />
              </Suspense>
            }
          />
        </Route>
        ,
        <Route path="auctions" element={<Redirect url="/" />} />,
        <Route path="auctions/:name" element={<Redirect url="/" />} />,
        {/* <Route
          path="auctions"
          element={
            <Suspense
              fallback={
                <PageLoader loading={true} message={'Loading, please wait'} />
              }
            >
              <Auctions />
            </Suspense>
          }
        />
        ,
        <Route
          path="auctions/:name"
          element={
            <Suspense
              fallback={
                <PageLoader loading={true} message={'Loading, please wait'} />
              }
            >
              <ViewAuction />
            </Suspense>
          }
        /> */}
        <Route
          path="register/:name"
          element={
            <Suspense
              fallback={
                <PageLoader loading={true} message={'Loading, please wait'} />
              }
            >
              <Register />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense
              fallback={
                <PageLoader loading={true} message={'Loading, please wait'} />
              }
            >
              <NotFound />
            </Suspense>
          }
        />
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
