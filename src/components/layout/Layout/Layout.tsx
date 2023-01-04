import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState.js';
import Footer from '../Footer/Footer';
import NavBar from '../Navbar/Navbar';
import { Notifications } from '../Notifications/Notifcations.js';
import './styles.css';

function Layout() {
  const [{ errors, notifications }] = useGlobalState();

  return (
    <>
      <div className="header">
        <NavBar />
      </div>
      <div className="body">
        <Outlet />
        <Notifications notifications={new Set([...errors, ...notifications])} />
      </div>
      <div className="footer">
        <Footer />
      </div>
    </>
  );
}

export default Layout;
