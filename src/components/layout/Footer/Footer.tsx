import { QuestionCircleOutlined } from '@ant-design/icons';
import MarkdownModal from '@src/components/modals/MarkdownModal';
import { Tooltip } from 'antd';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import changeLog from '../../../../CHANGELOG.md?raw';
import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { APP_VERSION } from '../../../utils/constants';
import { BrandLogo } from '../../icons';

const FORMATTED_CHANGELOG = changeLog
  .substring(changeLog.indexOf('## [Unreleased]') + 16)
  .trim()
  .replace(/\[([\w.]+)\]/g, (match, text) => `v${text}`);

function Footer() {
  const [showChangeLogModal, setShowChangeLogModal] = useState(false);

  return (
    <div
      className={
        'flex-row w-full p-2 md:p-8 md:px-0 border-t border-dark-grey '
      }
      style={{
        gap: '0rem',
      }}
    >
      <div className={'flex-row flex-center md:flex-left p-2 md:p-0'}>
        <span className="hidden md:block">
          <BrandLogo width={'30px'} height={'30px'} fill={'var(--text-grey)'} />
        </span>
        <Link
          className="grey text hover:text-white"
          to={'https://ar.io/legal/terms-of-service-and-privacy-policy'}
          rel="noreferrer"
          target={'_blank'}
        >
          <span style={{ whiteSpace: 'nowrap' }}>Terms & Conditions</span>
        </Link>
      </div>

      <div
        className={
          'flex-row text-center md:text-right md:flex-right p-2 md:p-0'
        }
      >
        <Tooltip
          title="Show Changelog"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="flex flex-row flex-right text grey center hover:text-white"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setShowChangeLogModal(true)}
          >
            v{APP_VERSION}-{import.meta.env.VITE_GITHUB_HASH?.slice(0, 6)}
          </button>
        </Tooltip>
      </div>

      <div className="flex-row flex-center md:flex-right p-2 md:p-0">
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
            <FaGithub className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
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
            <FaDiscord className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
          </button>
        </Tooltip>
        <Tooltip
          title="Documentation"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
        >
          <button
            className="button grey text center hover pointer hover:text-white"
            onClick={() => window.open('https://docs.ar.io/arns', '_blank')}
          >
            <QuestionCircleOutlined className="text-base" />
          </button>
        </Tooltip>
      </div>
      {showChangeLogModal ? (
        <MarkdownModal
          title="Changelog"
          markdownText={FORMATTED_CHANGELOG}
          onClose={() => setShowChangeLogModal(false)}
        />
      ) : null}
    </div>
  );
}

export default Footer;
