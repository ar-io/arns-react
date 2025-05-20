import { Logger } from '@ar.io/sdk/web';
import * as Sentry from '@sentry/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { Suspense, useMemo } from 'react';
import {
  Navigate,
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout } from './components/layout';
import { ANT_FLAG } from './components/layout/Breadcrumbs/Breadcrumbs';
import PageLoader from './components/layout/progress/PageLoader/PageLoader';
import Checkout from './components/pages/Register/Checkout';
import ArNSSettings from './components/pages/Settings/ArNSSettings';
import NetworkSettings from './components/pages/Settings/NetworkSettings';
import SettingsOverview from './components/pages/Settings/SettingsOverview';
import useWanderEvents from './hooks/useWanderEvents/useWanderEvents';
import './index.css';
import { useGlobalState } from './state';

// set the log level of ar-io-sdk
Logger.default.setLogLevel('none');

const Manage = React.lazy(() => import('./components/pages/Manage/Manage'));
const Home = React.lazy(() => import('./components/pages/Home/Home'));
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

const ConnectWalletModal = React.lazy(
  () => import('./components/modals/ConnectWalletModal/ConnectWalletModal'),
);
const ExtendLease = React.lazy(
  () => import('./components/layout/ExtendLease/ExtendLease'),
);
const UpgradeUndernames = React.lazy(
  () => import('./components/layout/UpgradeUndernames/UpgradeUndernames'),
);

const SettingsLayout = React.lazy(
  () => import('./components/pages/Settings/SettingsLayout'),
);
const Prices = React.lazy(() => import('./components/pages/Prices/Prices'));

const RNPPage = React.lazy(() => import('./components/pages/RNPPage/RNPPage'));

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createHashRouter);

function App() {
  useWanderEvents();
  const [{ turboNetwork }] = useGlobalState();

  const stripePromise = useMemo(() => {
    return loadStripe(turboNetwork.STRIPE_PUBLISHABLE_KEY);
  }, [turboNetwork.STRIPE_PUBLISHABLE_KEY]);

  const router = sentryCreateBrowserRouter(
    createRoutesFromElements(
      <>
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
                    <Manage />
                  </Suspense>
                }
              />
            </Route>
            <Route
              path="ants/:id"
              element={
                <Suspense
                  fallback={
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  <ManageANT />
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
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  <Undernames />
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
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  <ManageDomain />
                </Suspense>
              }
              handle={{
                crumbs: (data: string) => [
                  { name: 'Manage Assets', route: '/manage/names' },
                  {
                    name: data,
                    route: `/manage/names/${data}`,
                  },
                ],
              }}
            />
            <Route
              path="names/:name/upgrade-undernames"
              element={
                <Suspense
                  fallback={
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  <UpgradeUndernames />
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
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  <Undernames />
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
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  <ExtendLease />
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
          <Route path="transaction">
            <Route
              path="review"
              element={
                <Suspense
                  fallback={
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
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
                    <PageLoader
                      loading={true}
                      message={'Loading, please wait'}
                    />
                  }
                >
                  <TransactionComplete />
                </Suspense>
              }
            />
          </Route>
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
            path="/checkout"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                <Checkout />
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
          <Route
            path="/returned-names"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                <RNPPage />
              </Suspense>
            }
          />{' '}
          <Route
            path="/prices"
            element={
              <Suspense
                fallback={
                  <PageLoader loading={true} message={'Loading, please wait'} />
                }
              >
                <Prices />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="settings"
          element={
            <Suspense
              fallback={
                <PageLoader loading={true} message={'Loading, please wait'} />
              }
            >
              <SettingsLayout />
            </Suspense>
          }
        >
          <Route index element={<SettingsOverview />} />
          <Route path={'arns'} element={<ArNSSettings />} />
          <Route path={'network'} element={<NetworkSettings />} />
        </Route>
      </>,
    ),
  );

  return (
    <>
      <Elements
        key={turboNetwork.STRIPE_PUBLISHABLE_KEY}
        stripe={stripePromise}
      >
        <RouterProvider router={router} />
      </Elements>
    </>
  );
}

export default App;
