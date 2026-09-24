import {
  CONSOLE_MIGRATION_NOTICE_KEY,
  getConsoleLink,
} from '@src/utils/constants';
import { ExternalLinkIcon, XIcon } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Routes where a popup would interrupt a purchase or on-chain action. The
// top banner still shows there; the popup waits until the user lands on a
// browsing page.
const SUPPRESSED_ROUTES = [
  /^\/transaction/,
  /^\/register\//,
  /^\/checkout/,
  /^\/connect/,
  /^\/manage\/names\/[^/]+\/(extend|upgrade-undernames)/,
];

// localStorage can throw (private mode, blocked site data). Failing open
// means the popup may show again, which is better than breaking the page.
function isDismissed(): boolean {
  try {
    return localStorage.getItem(CONSOLE_MIGRATION_NOTICE_KEY) !== null;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(CONSOLE_MIGRATION_NOTICE_KEY, `${Date.now()}`);
  } catch {
    // ignore — see isDismissed
  }
}

const CONSOLE_FEATURES = [
  'Search, buy, and manage ArNS names',
  'Upload files to Arweave',
  'Deploy pages and websites',
];

function ConsoleMigrationModal() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isDismissed()) return;
    if (SUPPRESSED_ROUTES.some((route) => route.test(pathname))) return;
    setOpen(true);
  }, [pathname]);

  function handleOpenChange(next: boolean) {
    if (!next) markDismissed();
    setOpen(next);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* z-[2100] sits above antd notifications (2050) so error toasts
            can't cover the buttons on small screens. */}
        <Dialog.Overlay className="fixed inset-0 z-[2100] bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          data-testid="console-migration-modal"
          // Radix focuses the close button on open, which paints a focus ring
          // before the user has done anything. Focus trap still applies.
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[2100] flex max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-lg border border-dark-grey bg-metallic-grey p-6 text-white shadow-one sm:p-8"
        >
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 rounded p-1 text-grey transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <XIcon size={20} />
          </Dialog.Close>

          <div className="flex flex-col gap-2 pr-6">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              New home for ArNS
            </span>
            <Dialog.Title className="text-xl font-bold leading-snug sm:text-2xl">
              Try Ar.io Console
            </Dialog.Title>
          </div>

          <Dialog.Description className="text-sm leading-relaxed text-light-grey">
            Everything you do here now lives in Ar.io Console, along with more
            tools for building on Arweave.
          </Dialog.Description>

          <ul className="flex flex-col gap-2 text-sm text-white">
            {CONSOLE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>

          <p className="rounded-md border border-dark-grey bg-foreground px-4 py-3 text-sm leading-relaxed text-light-grey">
            This app still works, but we'll stop supporting it in the coming
            months.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close className="rounded-md border border-dark-grey px-5 py-3 text-sm font-medium text-light-grey transition-colors hover:border-grey hover:text-white">
              Not now
            </Dialog.Close>
            <a
              href={getConsoleLink('popup')}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleOpenChange(false)}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              Go to Console
              <ExternalLinkIcon size={16} />
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ConsoleMigrationModal;
