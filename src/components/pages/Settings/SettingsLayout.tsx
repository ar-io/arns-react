import { BrandLogo } from '@src/components/icons';
import { NavBar } from '@src/components/layout';
import Footer from '@src/components/layout/Footer/Footer';
import { NetworkIcon } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const settingsRoutes = [
  {
    name: 'ArNS Registry',
    path: 'arns',
    icon: <BrandLogo width={'20px'} height={'20px'} fill={'inherit'} />,
  },
  {
    name: 'Network',
    path: 'network',
    icon: <NetworkIcon width={'20px'} height={'20px'} fill={'none'} />,
  },
];

function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-full h-screen box-border">
      <div className="bg-foreground">
        <NavBar />
      </div>
      <div className="flex flex-col w-full h-full px-[100px] py-[30px]">
        <div className="flex flex-col w-full rounded-t-xl bg-metallic-grey border-x-[1px] border-t-[1px] border-dark-grey p-2">
          <h1
            className="flex flex-row text-white text-xl pl-3 "
            style={{ gap: '15px' }}
          >
            <Link
              to={'/settings'}
              className={
                location?.pathname?.split('/')?.at(-1) == 'settings'
                  ? ''
                  : 'text-grey' + ' hover:text-primary transition-all'
              }
            >
              Settings
            </Link>{' '}
            <span className="text-dark-grey">
              {location?.pathname?.split('/')?.at(-1) == 'settings' ? '' : '>'}
            </span>{' '}
            {
              settingsRoutes.find(
                (route) => location?.pathname?.split('/')?.at(-1) == route.path,
              )?.name
            }
          </h1>
        </div>
        <div
          className="flex flex-row w-full h-full rounded-xl rounded-t-none  bg-primary-gradient-thin border-dark-grey border-[1px]"
          style={{ gap: 0 }}
        >
          <div className="flex flex-col w-fit h-full text-white max-w-[300px] bg-metallic-grey border-r-[1px] border-dark-grey rounded-bl-xl">
            <div className="flex flex-col py-2 px-4 gap-3">
              {settingsRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`${
                    location?.pathname?.split('/')?.at(-1) == route.path
                      ? 'bg-primary text-black fill-black'
                      : ' text-white fill-white  opacity-[0.4]'
                  } flex  flex-row py-1.5 px-4 items-center justify-start whitespace-nowrap rounded-md hover:opacity-100 hover:scale-105 transition-all`}
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
