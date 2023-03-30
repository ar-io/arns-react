import {
  Navigate,
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import { Layout, ProtectedRoute } from './components/layout';
import {
  ConnectWalletModal,
  CreateAntModal,
  ManageAntModal, // ManageAntModal,
} from './components/modals';
import { About, Home, Manage, NotFound } from './components/pages';
import { useArNSContract, useArweave } from './hooks/';
import './index.css';
import RegistrationStateProvider from './state/contexts/RegistrationState';
import { registrationReducer } from './state/reducers/RegistrationReducer';

function App() {
  // dispatches global state
  useArNSContract();
  // setup default arweave data provider
  useArweave();

  const router = createHashRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route
          index
          element={
            <RegistrationStateProvider reducer={registrationReducer}>
              <Home />
            </RegistrationStateProvider>
          }
        />
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
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <ManageAntModal />
                </ProtectedRoute>
              }
            />
            <Route
              path=":name"
              element={
                <ProtectedRoute>
                  <div>Manage name page</div>
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>
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
