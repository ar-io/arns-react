import { useANTVersions } from '@src/hooks/useANTVersions';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { isArweaveTransactionID } from '@src/utils';
import ReactMarkdown from 'react-markdown';

import { Loader } from '../layout';
import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';

function AntChangelog({ className }: { className?: string }) {
  const { data: versions, isLoading, refetch, error } = useANTVersions();
  if (isLoading) {
    return <Loader size={80} />;
  }
  if (!versions || Object.keys(versions).length === 0 || error) {
    return (
      <div className="text-grey">
        No versions found
        <button onClick={() => refetch()}>Refresh</button>
      </div>
    );
  }

  const FORMATTED_CHANGELOG = Object.entries(versions ?? {})
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(
      ([version, { moduleId, notes }]) =>
        `## [${version}] - ${moduleId}\n${notes}`,
    )
    .join('\n')
    .trim()
    .replace(/\[([\d.]+)\]/g, (_, text) => `v${text}`)
    .replace(/<!--.*?-->/g, () => ``) // remove comments
    .replace(/\[([A-Za-z0-9_-]{43})\]/g, (_, text) => `${text}`);

  const headerRegex = /(v\d.)/g;

  return (
    <div
      data-testid="ant-changelog-card"
      className="flex flex-col scrollbar h-full min-h-[7.5rem] mb-4 overflow-y-scroll overflow-x-hidden scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2"
    >
      <ReactMarkdown
        includeElementIndex
        className={className}
        children={FORMATTED_CHANGELOG ?? '# No changelog'}
        components={{
          code: ({ children }) => {
            return <code className="text-grey text-sm">{children}</code>;
          },
          h1: ({ children }) => {
            return (
              <div>
                {children == 'Change Log' ? (
                  <></>
                ) : (
                  <h1 className="pb-4 text-2xl whitespace-nowrap">
                    {children}
                  </h1>
                )}
              </div>
            );
          },
          h2: ({ children, index }) => {
            // TODO: add date on published module versions (when available)
            const [version, id] = (children[0] as string).trim().split(' - ');
            const isFirstHeader = index == 0;

            if (!isArweaveTransactionID(id)) {
              return <></>;
            }
            return (
              <div>
                {!isFirstHeader && (
                  <div className="my-5 h-[1px] bg-dark-grey"></div>
                )}
                <h2
                  className={
                    'flex flex-row p-3 text-base whitespace-nowrap border-l rounded justify-between items-center mb-2  ' +
                    (isFirstHeader
                      ? 'bg-primary-thin border-primary text-primary '
                      : 'border-grey mt-2 bg-background text-grey')
                  }
                  style={{ gap: '10px' }}
                >
                  <div className="flex gap-3">
                    {version}

                    {/* TODO: add date on published module versions */}
                  </div>

                  <ArweaveID
                    id={new ArweaveTransactionID(id)}
                    type={ArweaveIdTypes.TRANSACTION}
                    characterCount={12}
                    shouldLink={true}
                    wrapperStyle={{
                      width: 'fit-content',
                      fontSize: '14px',
                    }}
                  />
                </h2>
              </div>
            );
          },
          h3: ({ children }) => {
            return (
              <h3 className={'p-3 text-base whitespace-nowrap'}>{children}</h3>
            );
          },
          li: ({ children }) => {
            const match = headerRegex.exec(children.toString());
            if (match) {
              const version = match[1];
              const id = match[2];
              const date = match[3];
              return (
                <li className="ml-8 py-2 list-disc text-sm text-grey">
                  <div>Version: {version}</div>
                  <div>ID: {id}</div>
                  <div>Date: {date}</div>
                </li>
              );
            }
            return (
              <li className="ml-8 py-2 list-disc text-sm text-grey">
                {children}
              </li>
            );
          },
        }}
      />
    </div>
  );
}

export default AntChangelog;
