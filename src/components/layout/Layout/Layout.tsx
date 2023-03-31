import { Outlet } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import RegistrationStateProvider from '../../../state/contexts/RegistrationState';
import { registrationReducer } from '../../../state/reducers/RegistrationReducer';
import Footer from '../Footer/Footer';
import NavBar from '../Navbar/Navbar';
import { Notifications } from '../Notifications/Notifications';
import './styles.css';

function Layout() {
  const [{ notifications }] = useGlobalState();

  return (
    <>
      <RegistrationStateProvider reducer={registrationReducer}>
        <div className="header">
          <NavBar />
        </div>
        <div className="body">
          <Outlet />
          {/* TODO: add errors here */}
          <Notifications notifications={notifications} />
        </div>
        <div className="footer">
          <Footer />
        </div>
      </RegistrationStateProvider>
    </>
  );
}

export default Layout;
