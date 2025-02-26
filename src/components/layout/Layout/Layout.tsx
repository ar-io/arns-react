import DevTools from '@src/components/devtools/DevTools';
import { useArNSState } from '@src/state';
import { Progress } from 'antd';
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
    <div
      className="flex flex-col"
      style={{
        gap: 0,
        position: 'relative',
        boxSizing: 'border-box',
        height: '100vh',
      }}
    >
      {showBanner && <TopBanner />}
      <div
        id="layout"
        className="flex flex-row"
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
          prefixCls="arns-state-progress animate-pulse"
          type={'line'}
          percent={percentLoaded}
          strokeColor={{
            '0%': '#F7C3A1',
            '100%': '#DF9BE8',
          }}
          strokeLinecap="square"
          trailColor={'transparent'}
          format={() => <></>}
        />
      ) : (
        <div className="p-[4px]" />
      )}

      <div className="body">
        <Outlet />
        <Notifications />
      </div>
      <div
        className="flex flex-row"
        style={{
          boxSizing: 'border-box',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          height: '100%',
        }}
      >
        <Footer />
      </div>
      <DevTools />
    </div>
  );
}

export default Layout;
