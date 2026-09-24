import { getConsoleLink } from '@src/utils/constants';
import { ExternalLinkIcon } from 'lucide-react';

const TopBanner = () => {
  return (
    <div
      data-testid="console-migration-banner"
      className="w-full bg-primary px-4 py-2.5 text-center text-sm leading-snug text-black"
    >
      The ArNS app is moving to Ar.io Console.{' '}
      <a
        href={getConsoleLink('banner')}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 whitespace-nowrap font-bold underline underline-offset-2"
      >
        Try Console
        <ExternalLinkIcon size={14} />
      </a>
    </div>
  );
};

export default TopBanner;
