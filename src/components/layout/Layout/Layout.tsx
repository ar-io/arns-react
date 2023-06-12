import { Outlet } from 'react-router-dom';

import Footer from '../Footer/Footer';
import NavBar from '../Navbar/Navbar';
import Notifications from '../Notifications/Notifications';
import './styles.css';

function Layout() {
  return (
    <>
      <div
        className="flex flex-row"
        style={{
          backgroundColor: 'var(--card-bg)',
          boxSizing: 'border-box',
          margin: '0px',
        }}
      >
        <NavBar />
      </div>
      <div className="body">
        <Outlet />
        {/* TODO: add errors here */}
        <Notifications />
      </div>
      <div
        className="flex flex-row"
        style={{
          boxSizing: 'border-box',
        }}
      >
        <Footer />
      </div>
    </>
  );
}

export default Layout;
