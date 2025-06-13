import MarkdownModal from '@src/components/modals/MarkdownModal';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import changeLog from '../../../../CHANGELOG.md?raw';
import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { APP_VERSION } from '../../../utils/constants';
import { Tooltip } from '../../data-display';
import { BrandLogo } from '../../icons';

const FORMATTED_CHANGELOG = changeLog
  .substring(changeLog.indexOf('## [Unreleased]') + 16)
  .trim()
  .replace(/\[([\w.]+)\]/g, (match, text) => `v${text}`);

function Footer() {
  const [showChangeLogModal, setShowChangeLogModal] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between border-t border-dark-grey box-border px-[100px] py-[15px] max-sm:px-[15px]">
      <div className="flex flex-row items-center gap-2 w-fit">
        <BrandLogo width={'30px'} height={'30px'} fill={'var(--text-grey)'} />
        <Link
          className="grey text hover:text-white"
          to={'https://ar.io/legal/terms-of-service-and-privacy-policy'}
          rel="noreferrer"
          target={'_blank'}
        >
          <span style={{ whiteSpace: 'nowrap' }}>Terms & Conditions</span>
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex flex-row justify-end items-center gap-2 w-fit">
        <Tooltip message="Show Changelog">
          <button
            className="flex flex-row flex-right text grey center hover:text-white"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setShowChangeLogModal(true)}
          >
            v{APP_VERSION}-{import.meta.env.VITE_GITHUB_HASH?.slice(0, 6)}
          </button>
        </Tooltip>
        <Tooltip message="Github">
          <button
            className="button grey text center hover pointer"
            onClick={() => window.open('https://github.com/ar-io/', '_blank')}
          >
            <FaGithub className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
          </button>
        </Tooltip>
        <Tooltip message="Discord">
          <button
            className="button grey text center hover pointer"
            onClick={() => window.open(ARIO_DISCORD_LINK, '_blank')}
          >
            <FaDiscord className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
          </button>
        </Tooltip>
        <Tooltip message="Documentation">
          <button
            className="button grey text-center hover:text-white cursor-pointer"
            onClick={() => window.open('https://docs.ar.io/arns', '_blank')}
          >
            <HelpCircle className="text-base" />
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
