import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { BrandLogo, CloseIcon } from '../../icons';
import './styles.css';

function Footer() {
  const isMobile = useIsMobile();

  const [showTestnetBanner, setShowTestnetBanner] = useState(true);

  return (
    <div
      className={'flex-row app-footer'}
      style={{
        borderTop: '1px solid var(--text-faded)',
        boxSizing: 'border-box',
      }}
    >
      <div className={'flex-row flex-left'} style={{ width: 'fit-content' }}>
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
        {showTestnetBanner && !isMobile && (
          <div>
            <div
              className="flex-row"
              style={{
                margin: 'auto',
                width: 'fit-content',
                borderRadius: 6,
                backgroundColor: 'var(--accent)',
                color: 'var(--text-black)',
                padding: '12px 18px',
                gap: '16px',
              }}
            >
              <div>
                Please help improve ArNS by taking this 2 minute{' '}
                <Link
                  to="https://pds-inc.typeform.com/arns-test-app"
                  target="_blank"
                  rel="noreferrer"
                  className="link hover"
                  style={{
                    display: 'inline',
                    color: 'var(--text-black)',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
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
                  fill="var(--text-black)"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex-row flex-right"
        style={{ width: 'fit-content', gap: '15px' }}
      >
        <span
          className="flex flex-row flex-right text grey center"
          style={{ whiteSpace: 'nowrap' }}
        >
          v{process.env.npm_package_version}-
          {process.env.VITE_GITHUB_HASH?.slice(0, 6)}
        </span>
        <Tooltip
          title="Github"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="button grey text center hover pointer"
            onClick={() =>
              window.open('https://github.com/ar-io/arns-react', '_blank')
            }
          >
            <FaGithub style={{ fontSize: 20 }} />
          </button>
        </Tooltip>
        <Tooltip
          title="Discord"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="button grey text center hover pointer"
            onClick={() => window.open(ARIO_DISCORD_LINK, '_blank')}
          >
            <FaDiscord style={{ fontSize: 20 }} />
          </button>
        </Tooltip>
        <Tooltip
          title="Documentation"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="button grey text center hover pointer"
            onClick={() => window.open('https://ar.io/docs/arns', '_blank')}
          >
            <QuestionCircleOutlined style={{ fontSize: 20 }} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default Footer;
