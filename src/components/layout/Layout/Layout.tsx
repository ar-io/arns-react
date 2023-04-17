import { Outlet } from 'react-router-dom';

import Footer from '../Footer/Footer';
import NavBar from '../Navbar/Navbar';
import './styles.css';

function Layout() {
  return (
    <>
      <div className="header">
        <NavBar />
      </div>
      <div className="body">
        <Outlet />
        {/* TODO: add errors here */}
      </div>
      <div className="footer">
        <Footer />
      </div>
    </>
  );
}

export default Layout;
