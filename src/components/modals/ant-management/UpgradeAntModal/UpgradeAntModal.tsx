import { ANT_LUA_ID } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { CloseIcon } from '@src/components/icons';
import { Loader } from '@src/components/layout';
import { formatForMaxCharCount } from '@src/utils';
import { DEFAULT_ARWEAVE } from '@src/utils/constants';
import { fromB64Url } from '@src/utils/encodings';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import './styles.css';

function UpgradeAntModal({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const [changelog, setChangelog] = useState('default changelog');
  const { data: luaCodeTx, isLoading } = useQuery({
    queryKey: [ANT_LUA_ID],
    queryFn: async () => {
      return await DEFAULT_ARWEAVE.transactions.get(ANT_LUA_ID);
    },
  });

  useEffect(() => {
    const newChanges = luaCodeTx?.tags.find(
      (tag) => fromB64Url(tag.name) === 'Changelog',
    );
    setChangelog(
      newChanges?.value ? fromB64Url(newChanges.value) : 'No changelog found',
    );
  }, [luaCodeTx]);

  function handleClose() {
    setVisible(false);
    setAccepted(false);
  }

  if (!visible) return <></>;

  if (isLoading) {
    return (
      <div className="modal-container items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="modal-container items-center justify-center">
      <div className="flex h-[70%] w-[500px] flex-col rounded-lg bg-foreground shadow-one">
        <div className="flex flex-row justify-between border-b-[1px] border-dark-grey p-4">
          <h1
            className="flex flex-row text-2xl text-white"
            style={{ gap: '10px' }}
          >
            Upgrade your ANT's
          </h1>
          <button className="text-md text-white" onClick={() => handleClose()}>
            <CloseIcon width={'20px'} fill={'white'} />
          </button>
        </div>

        <div className="flex h-full w-full flex-col p-4 text-sm text-white">
          <ReactMarkdown
            className={'h-full'}
            children={changelog}
            components={{
              h1: ({ children }) => (
                <h1 className="pb-2 text-2xl">{children}</h1>
              ),
              h2: ({ children }) => <h2 className="p-2 text-xl">{children}</h2>,
              h3: ({ children }) => <h3 className="p-2 text-lg">{children}</h3>,
              li: ({ children }) => (
                <li className="ml-8 list-disc text-sm text-grey">{children}</li>
              ),
            }}
          />
          <span className="pt-2 text-lg">
            View the code:{' '}
            <a
              className="text-link"
              href={`https://arscan/transaction/${ANT_LUA_ID}`}
              target="_blank"
              rel="noreferrer"
            >
              {formatForMaxCharCount(ANT_LUA_ID, 8)}
            </a>
          </span>
          <span
            className="flex flex-row items-center py-4"
            style={{ gap: '10px' }}
          >
            <Checkbox
              rootClassName="accept-checkbox"
              onChange={(checked) => setAccepted(checked.target.checked)}
              value={accepted}
            />
            I understand the purpose and wish to proceed{' '}
            <Tooltip
              message={
                'This will conduct an `Eval` Action on your ANT process to upgrade the code to the latest version'
              }
            />
          </span>
        </div>
        <div>
          <button
            disabled={!accepted}
            className={`${!accepted ? 'bg-dark-grey text-grey' : 'animate-pulse bg-primary-thin text-primary hover:bg-primary hover:text-black'} w-full rounded-b-lg p-2 transition-all`}
            onClick={() => setAccepted(true)}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeAntModal;
