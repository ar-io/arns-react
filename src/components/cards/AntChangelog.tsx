import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { isArweaveTransactionID } from '@src/utils';
import { ANT_CHANGELOG, DEFAULT_ANT_LUA_ID } from '@src/utils/constants';
import ReactMarkdown from 'react-markdown';

import ArweaveID, { ArweaveIdTypes } from '../layout/ArweaveID/ArweaveID';

function AntChangelog({ className }: { className?: string }) {
  console.log(ANT_CHANGELOG);
  const FORMATTED_CHANGELOG = ANT_CHANGELOG.substring(
    ANT_CHANGELOG.indexOf('## [Unreleased]') + 16,
  )
    .trim()
    .replace(/\[([\d.]+)\]/g, (match, text) => `v${text}`)
    .replace(/<!--.*?-->/g, (match, text) => ``) // remove comments
    .replace(/\[([A-Za-z0-9_-]{43})\]/g, (match, text) => `${text}`);

  const headerRegex = /(v\d.)/g;

  return (
    <div
      data-testid="ant-changelog-card"
      className="flex flex-col scrollbar h-full min-h-[120px] mb-4 overflow-y-scroll overflow-x-hidden scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2"
    >
      <ReactMarkdown
        includeElementIndex
        className={className}
        children={FORMATTED_CHANGELOG ?? '# No changelog'}
        components={{
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
            const [version, id, date] = (children[0] as string)
              .trim()
              .split(' - ');
            const isFirstHeader = index == 0 && id == DEFAULT_ANT_LUA_ID;

            if (!isArweaveTransactionID(id)) {
              return <></>;
            }
            const formattedDate = new Date(
              date.replace(/[\(\)]/g, ''),
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            return (
              <div>
                {!isFirstHeader && (
                  <div className="my-5 h-[1px] bg-dark-grey"></div>
                )}
                <h2
                  className={
                    'flex flex-row p-3 text-[16px] whitespace-nowrap border-l rounded justify-between items-center mb-2  ' +
                    (isFirstHeader
                      ? 'bg-primary-thin border-primary text-primary '
                      : 'border-grey mt-2 bg-background text-grey')
                  }
                  style={{ gap: '10px' }}
                >
                  <div className="flex gap-3">
                    {version}

                    <span
                      className={
                        'text-[16px] w-fit italic ' +
                        (isFirstHeader ? 'text-white' : 'text-grey')
                      }
                    >
                      {formattedDate}
                    </span>
                  </div>

                  <ArweaveID
                    id={new ArweaveTransactionID(id)}
                    type={ArweaveIdTypes.TRANSACTION}
                    characterCount={12}
                    shouldLink={true}
                    wrapperStyle={{
                      width: 'fit-content',
                    }}
                  />
                </h2>
              </div>
            );
          },
          h3: ({ children }) => {
            return (
              <h3 className={'p-3 text-[16px] whitespace-nowrap'}>
                {children}
              </h3>
            );
          },
          li: ({ children }) => {
            const match = headerRegex.exec(children.toString());
            if (match) {
              const version = match[1];
              const id = match[2];
              const date = match[3];
              return (
                <li className="ml-8 py-2 list-disc text-[16px] text-grey">
                  <div>Version: {version}</div>
                  <div>ID: {id}</div>
                  <div>Date: {date}</div>
                </li>
              );
            }
            return (
              <li className="ml-8 py-2 list-disc text-[16px] text-grey">
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
