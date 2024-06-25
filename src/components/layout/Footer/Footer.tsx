import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FaGithub } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { BrandLogo } from '../../icons';
import './styles.css';

function Footer() {
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
          to={'https://ar.io/legal/terms-of-service-and-privacy-policy'}
          rel="noreferrer"
          target={'_blank'}
        >
          <span style={{ whiteSpace: 'nowrap' }}>Terms & Conditions</span>
        </Link>
      </div>

      <div
        className="flex-space-between"
        style={{
          width: '100%',
        }}
      ></div>

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
            onClick={() => window.open('https://github.com/ar-io/', '_blank')}
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
            onClick={() => window.open('https://docs.ar.io/arns', '_blank')}
          >
            <QuestionCircleOutlined style={{ fontSize: 20 }} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export default Footer;
