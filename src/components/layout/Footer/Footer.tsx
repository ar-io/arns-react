import { QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { BrandLogo } from '../../icons';
import Popup from '../Popup/Popup';

function Footer() {
  const isMobile = useIsMobile();
  return (
    <div
      className={`${
        !isMobile ? 'flex-row flex-space-between' : 'flex-column flex-center'
      }`}
      style={{
        borderTop: '1px solid var(--text-faded)',
        padding: '30px 100px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className={`${
          !isMobile ? 'flex-row flex-left' : 'flex-column flex-center'
        } flex`}
      >
        <BrandLogo width={'30px'} height={'30px'} fill={'var(--text-grey)'} />
        <Link
          className="grey text"
          to={'https://ar.io/terms-and-conditions/'}
          rel="noreferrer"
          target={'_blank'}
        >
          Terms & Conditions
        </Link>
      </div>

      <div className="flex flex-row flex-right">
        <span
          className="flex flex-row flex-right text grey center"
          style={{ width: 'fit-content', wordBreak: 'keep-all' }}
        >
          v{process.env.npm_package_version}-
          {process.env.VITE_GITHUB_HASH?.slice(0, 6)}
        </span>
        <Popup
          title={'Contact Support'}
          popupMenuOptions={[
            {
              title: 'Github',
              onClick: () =>
                window.open('https://github.com/ar-io/arns-react', '_blank'),
            },
            {
              title: 'Discord',
              onClick: () =>
                window.open('https://discord.gg/7dBaqcE8', '_blank'),
            },
          ]}
        >
          <button className="button grey text center hover">
            <QuestionCircleOutlined style={{ fontSize: 20 }} />
          </button>
        </Popup>
      </div>
    </div>
  );
}

export default Footer;
