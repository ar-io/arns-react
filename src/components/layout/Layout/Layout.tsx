import { Progress } from '@src/components/ui/Progress';
import { useArNSState } from '@src/state';
import { Outlet, useLocation } from 'react-router-dom';

import Footer from '../Footer/Footer';
import NavBar from '../Navbar/Navbar';
import Notifications from '../Notifications/Notifications';
import TopBanner from './TopBanner';
import './styles.css';

function Layout() {
  const location = useLocation();
  const [{ percentLoaded }] = useArNSState();

  const homeOrRegister =
    location.pathname === '/' || location.pathname.startsWith('/register');
  const julyEigth2024 = new Date('2024-07-08T00:00:00Z').getTime();
  const showBanner = homeOrRegister && Date.now() < julyEigth2024;

  return (
    <div className="flex flex-col relative min-h-screen bg-background">
      {showBanner && <TopBanner />}
      <div
        id="layout"
        className="flex flex-row w-full justify-between"
        style={{
          backgroundColor: 'var(--card-bg)',
          boxSizing: 'border-box',
          margin: '0px',
          minHeight: 'fit-content',
        }}
      >
        <NavBar />
      </div>

      {percentLoaded > 0 && percentLoaded < 100 ? (
        <Progress
          value={percentLoaded}
          className="animate-pulse bg-transparent"
          indicatorClassName="bg-gradient-to-r from-[#F7C3A1] to-[#DF9BE8]"
          size="sm"
        />
      ) : (
        <div className="p-[4px]" />
      )}

      <div className="flex flex-col flex-1 w-full">
        <Outlet />
        <Notifications />
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}

export default Layout;
