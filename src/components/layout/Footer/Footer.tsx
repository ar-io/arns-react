import MarkdownModal from '@src/components/modals/MarkdownModal';
import { Tooltip } from '@src/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import changeLog from '../../../../CHANGELOG.md?raw';
import { APP_VERSION, ARIO_DISCORD_LINK, ARNS_DOCS_LINK } from '../../../utils/constants';

const FORMATTED_CHANGELOG = changeLog
  .substring(changeLog.indexOf('## [Unreleased]') + 16)
  .trim()
  .replace(/\[([\w.]+)\]/g, (_match, text) => `v${text}`);

function Footer({ className = '' }: { className?: string }) {
  const [showChangeLogModal, setShowChangeLogModal] = useState(false);

  return (
    <div
      className={`flex flex-row w-full justify-center gap-16 p-2 md:p-8 md:px-0 border-t border-dark-grey bg-background ${className}`}
    >
      <div className="flex flex-row justify-center items-center p-2 md:p-0">
        <Link
          className="text-muted text hover:text-white"
          to={'https://ar.io/legal/terms-of-service-and-privacy-policy'}
          rel="noreferrer"
          target={'_blank'}
        >
          <span style={{ whiteSpace: 'nowrap' }}>Terms & Conditions</span>
        </Link>
      </div>

      <div className="flex flex-row text-center md:text-right p-2 md:p-0">
        <Tooltip content="Show Changelog" side="top">
          <button
            className="flex flex-row flex-right text text-muted text-center justify-center items-center hover:text-white"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setShowChangeLogModal(true)}
          >
            v{APP_VERSION}-{import.meta.env.VITE_GITHUB_HASH?.slice(0, 6)}
          </button>
        </Tooltip>
      </div>

      <div className="flex flex-row justify-center items-center gap-4 p-2 md:p-0">
        <Tooltip content="Github" side="top">
          <button
            className="button text-muted text text-center justify-center items-center hover pointer"
            onClick={() => window.open('https://github.com/ar-io/', '_blank')}
          >
            <FaGithub className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
          </button>
        </Tooltip>
        <Tooltip content="Discord" side="top">
          <button
            className="button text-muted text text-center justify-center items-center hover pointer"
            onClick={() => window.open(ARIO_DISCORD_LINK, '_blank')}
          >
            <FaDiscord className="size-4 stroke-grey fill-grey hover:stroke-white hover:fill-white" />
          </button>
        </Tooltip>
        <Tooltip content="Documentation" side="top">
          <button
            className="button text-muted text text-center justify-center items-center hover pointer hover:text-white"
            onClick={() => window.open(ARNS_DOCS_LINK, '_blank')}
          >
            <HelpCircle className="size-4" />
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
