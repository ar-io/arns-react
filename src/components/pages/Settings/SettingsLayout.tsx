import { BrandLogo } from '@src/components/icons';
import { NavBar } from '@src/components/layout';
import Footer from '@src/components/layout/Footer/Footer';
import { NetworkIcon } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import './styles.css';

const settingsRoutes = [
  {
    name: 'ArNS Registry',
    path: 'arns',
    icon: <BrandLogo className="size-4" fill={'inherit'} />,
  },
  {
    name: 'Network',
    path: 'network',
    icon: <NetworkIcon className="size-4" fill={'none'} />,
  },
];

function SettingsLayout() {
  const location = useLocation();
  const isSettingsRoot = location?.pathname?.split('/')?.at(-1) == 'settings';

  return (
    <div className="flex flex-col w-full h-screen box-border">
      <div className="bg-foreground">
        <NavBar />
      </div>
      <div className="flex flex-col w-full h-full px-[100px] py-[30px]">
        <div className="flex flex-col w-full rounded-t-xl  border-x-[1px] border-t-[1px] border-dark-grey p-2">
          <div
            className="flex flex-row text-white text-sm pl-3"
            style={{ gap: '15px' }}
          >
            <Link
              to={'/settings'}
              className={
                isSettingsRoot
                  ? ''
                  : 'text-grey' + ' hover:text-primary transition-all'
              }
            >
              Settings
            </Link>{' '}
            <span className="text-dark-grey">{isSettingsRoot ? '' : '>'}</span>{' '}
            {
              settingsRoutes.find(
                (route) => location?.pathname?.split('/')?.at(-1) == route.path,
              )?.name
            }
          </div>
        </div>
        <div
          className="flex flex-row w-full h-full rounded-xl rounded-t-none border-dark-grey border-[1px]"
          style={{ gap: 0 }}
        >
          <div className="flex flex-col w-fit h-full text-white max-w-[300px] border-r-[1px] border-dark-grey rounded-bl-xl">
            <div className="flex flex-col py-2 pt-4 px-4 gap-3">
              {settingsRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`${
                    location?.pathname?.split('/')?.at(-1) == route.path
                      ? 'bg-[#222224] text-white fill-white'
                      : ' text-white fill-white  opacity-[0.4]'
                  } flex  flex-row py-1.5 px-4 items-center justify-start whitespace-nowrap rounded-md hover:opacity-100 transition-all text-sm`}
                  style={{ gap: '5px' }}
                >
                  {route.icon}
                  <span className="ml-2">{route.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <Outlet />
        </div>
      </div>{' '}
      <Footer />
    </div>
  );
}

export default SettingsLayout;
