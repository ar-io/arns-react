import { Outlet } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import Footer from '../Footer/Footer';
import NavBar from '../Navbar/Navbar';
import Notifications from '../Notifications/Notifications';
import './styles.css';

function Layout() {
  const isMobile = useIsMobile();
  return (
    <div
      className="flex flex-column"
      style={{
        minHeight: '100vh',
        gap: 0,
        position: 'relative',
        paddingBottom: isMobile ? '350px' : '104px',
        boxSizing: 'border-box',
      }}
    >
      <div
        id="layout"
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
        <Notifications />
      </div>
      <div
        className="flex flex-row"
        style={{
          boxSizing: 'border-box',
          position: 'absolute',
          bottom: 0,
        }}
      >
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
