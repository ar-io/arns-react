import { Breadcrumb } from 'antd';
import { Link, useLocation, useParams } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { BrandLogo, ChevronDownIcon } from '../../icons';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

export type NavItem = {
  name: string;
  route: string;
};

function NavBar() {
  const { Item } = Breadcrumb;
  const [{ navItems }] = useGlobalState();
  const [, dispatchRegisterState] = useRegistrationState();
  const location = useLocation();
  const path = location.pathname.split('/');

  return (
    <div className="flex flex-column" style={{ gap: '0px' }}>
      <div
        className="flex-row flex-space-between"
        style={{
          boxSizing: 'border-box',
          padding: '0px 5%',
          minHeight: 75,
        }}
      >
        <div className="flex-row flex-left">
          <Link
            className="hover"
            to="/"
            onClick={() => {
              dispatchRegisterState({ type: 'reset' });
            }}
          >
            <BrandLogo width={'36px'} height={'36px'} fill={'white'} />
          </Link>
        </div>
        <NavGroup />
      </div>
      {/* TODO: improve this render logic with specific approved routes to render breadcrumb on */}
      {navItems && path.length >= 4 ? (
        <Breadcrumb
          className="flex flex-row center"
          style={{
            background: 'black',
            height: '50px',
            justifyContent: 'flex-start',
            paddingLeft: '5%',
            fontSize: '16px',
            color: 'var(--text-faded)',
          }}
          separator={
            <span
              style={{
                height: '100%',
                width: '30px',
                alignContent: 'center',
              }}
            >
              <ChevronDownIcon
                width={'10px'}
                height={'10px'}
                fill={'white'}
                style={{ transform: 'rotate(-90deg)' }}
              />
            </span>
          }
        >
          {navItems.map((item, index) => {
            return (
              <Item key={index} className="center faded">
                <Link
                  className="link faded hover"
                  style={{
                    fontSize: '16px',
                    color:
                      path.at(-1) === item.route.split('/').at(-1)
                        ? 'white'
                        : 'var(--text-grey)',
                  }}
                  to={item.route}
                >
                  {item.name}
                </Link>
              </Item>
            );
          })}
        </Breadcrumb>
      ) : (
        <></>
      )}
    </div>
  );
}

export default NavBar;
