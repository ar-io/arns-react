import { QuestionCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { BrandLogo, CloseIcon } from '../../icons';
import Popup from '../Popup/Popup';
import './styles.css';

function Footer() {
  const isMobile = useIsMobile();

  const [showTestnetBanner, setShowTestnetBanner] = useState(true);

  return (
    <div
      className={`${!isMobile ? 'flex-row' : 'flex-column flex-center'}`}
      style={{
        borderTop: '1px solid var(--text-faded)',
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
          <span style={{ whiteSpace: 'nowrap' }}>Terms & Conditions</span>
        </Link>
      </div>

      <div
        className="flex-space-between"
        style={{
          color: 'var(--text-subtle)',
          fontSize: '14px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {showTestnetBanner && (
          <div>
            <div
              className="flex-row"
              style={{
                margin: 'auto',
                width: 'fit-content',
                borderRadius: 6,
                backgroundColor: 'var(--card-bg)',
                padding: '12px 18px',
                gap: '16px',
              }}
            >
              <div>
                ArNS is part of the ar.io testnet phase. Please share your
                feedback on our 2 min{' '}
                <Link
                  to="https://pds-inc.typeform.com/to/TTrkj0MM"
                  target="_blank"
                  rel="noreferrer"
                  className="link hover"
                  style={{ display: 'inline' }}
                >
                  survey
                </Link>
                .
              </div>
              <button
                className="flex center pointer"
                style={{ padding: 0 }}
                onClick={() => setShowTestnetBanner(false)}
              >
                <CloseIcon
                  width={'16px'}
                  height={'16px'}
                  fill="var(--text-subtle)"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-row flex-right" style={{ width: 'fit-content' }}>
        <span
          className="flex flex-row flex-right text grey center"
          style={{ whiteSpace: 'nowrap' }}
        >
          v{process.env.npm_package_version}-
          {process.env.VITE_GITHUB_HASH?.slice(0, 6)}
        </span>
        <Popup
          title={'Contact Support'}
          trigger={'click'}
          popupMenuOptions={[
            {
              title: 'Github',
              onClick: () =>
                window.open('https://github.com/ar-io/arns-react', '_blank'),
            },
            {
              title: 'Discord',
              onClick: () => window.open(ARIO_DISCORD_LINK, '_blank'),
            },
          ]}
        >
          <button className="button grey text center hover pointer">
            <QuestionCircleOutlined style={{ fontSize: 20 }} />
          </button>
        </Popup>
      </div>
    </div>
  );
}

export default Footer;
