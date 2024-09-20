import {
  ANT_LUA_ID,
  ContractSigner,
  createAoSigner,
  evolveANT,
} from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { CloseIcon } from '@src/components/icons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useANTLuaSourceCode } from '@src/hooks/useANTLuaSourceCode';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState, useWalletState } from '@src/state';
import { formatForMaxCharCount, sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { Checkbox } from 'antd';
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import arioLoading from '../../../icons/ario-spinner.json';
import './styles.css';

function UpgradeAntModal({
  visible,
  setVisible,
  antId,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  antId: string;
}) {
  const [{ aoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const { data, isLoading } = useANTLuaSourceCode();
  const [accepted, setAccepted] = useState(false);
  const [changelog, setChangelog] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (data?.changelog) {
      setChangelog(data.changelog);
    }
  }, [data?.changelog]);
  function handleClose() {
    setVisible(false);
    setAccepted(false);
    setUpgrading(false);
  }

  async function upgradeAnts() {
    try {
      if (!wallet?.arconnectSigner || !walletAddress) {
        throw new Error('No ArConnect Signer found');
      }
      if (!data?.luaCodeTx) {
        throw new Error('No Lua Code Transaction found');
      }
      setUpgrading(true);

      const signer = createAoSigner(wallet?.arconnectSigner as ContractSigner);
      // deliberately not using concurrency here for UX reasons
      const failedUpgrades = [];

      await evolveANT({
        processId: antId,
        luaCodeTxId: ANT_LUA_ID,
        signer,
        ao: aoClient,
      }).catch(() => {
        failedUpgrades.push(antId);
      });

      if (failedUpgrades.length) {
        eventEmitter.emit('error', {
          name: 'Upgrade Error',
          message: `Issue upgrading ANT ${antId}, please try again later`,
        });
      } else {
        eventEmitter.emit('success', {
          message: (
            <div>
              <span>
                Updated ANT to source code{' '}
                <ArweaveID
                  characterCount={8}
                  shouldLink={true}
                  type={ArweaveIdTypes.TRANSACTION}
                  id={new ArweaveTransactionID(ANT_LUA_ID)}
                />
              </span>
            </div>
          ),
          name: `ANT successfully updated!`,
        });
      }
      // slight delay for UX so the stage is visible on shorter updates
      await sleep(3000);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      handleClose();
    }
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
      <div className="flex h-fit max-h-[70%] w-[500px] justify-between flex-col rounded-lg bg-foreground shadow-one">
        <div className="flex flex-row justify-between border-b-[1px] border-dark-grey p-4">
          <h1
            className="flex flex-row text-2xl text-white"
            style={{ gap: '10px' }}
          >
            Upgrade ANT
          </h1>
          <button
            disabled={upgrading}
            className="text-md text-white"
            onClick={() => handleClose()}
          >
            <CloseIcon width={'20px'} fill={'white'} />
          </button>
        </div>
        {!upgrading ? (
          <>
            <div className="flex box-border h-full overflow-hidden w-full flex-col p-4 text-sm text-white">
              <div className="flex scrollbar h-full min-h-[120px] border-b-[1px] border-dark-grey pb-4 mb-4 overflow-y-scroll scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2">
                <ReactMarkdown
                  className={'h-full'}
                  children={changelog}
                  components={{
                    h1: ({ children }) => (
                      <div>
                        {children == 'Changelog' ? (
                          <></>
                        ) : (
                          <h1 className="pb-4 text-2xl">{children}</h1>
                        )}
                      </div>
                    ),
                    h2: ({ children }) => (
                      <h2 className="p-2 text-xl">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="pl-2 text-lg">{children}</h3>
                    ),
                    li: ({ children }) => (
                      <li className="ml-8 list-disc text-sm text-grey">
                        {children}
                      </li>
                    ),
                  }}
                />
              </div>

              <span
                className="flex flex-row items-center py-4"
                style={{ gap: '10px' }}
              >
                <Checkbox
                  rootClassName="accept-checkbox"
                  onChange={(checked) => setAccepted(checked.target.checked)}
                  value={accepted}
                />
                I understand and wish to proceed{' '}
                <Tooltip
                  message={
                    <div className="flex flex-col">
                      <span>
                        This will conduct an &apos;Eval&apos; Action on your ANT
                        process to upgrade the code to the latest version
                      </span>
                      <span className="pt-2 text-primary">
                        View the code:{' '}
                        <a
                          className="text-link"
                          href={`https://arscan.io/tx/${ANT_LUA_ID}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatForMaxCharCount(ANT_LUA_ID, 8)}
                        </a>
                      </span>
                    </div>
                  }
                />
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Lottie
              animationData={arioLoading}
              loop={true}
              className="h-[250px]"
            />
          </div>
        )}

        {/* footer */}
        <div>
          <button
            disabled={!accepted}
            className={`${
              !accepted
                ? 'bg-background text-grey'
                : `animate-pulse ${
                    !upgrading
                      ? 'bg-primary-thin text-primary'
                      : 'bg-link text-white hover:bg-primary hover:text-black'
                  } `
            } w-full rounded-b-lg p-3 transition-all`}
            onClick={() => upgradeAnts()}
          >
            {!accepted && !upgrading
              ? 'Verify you understand before proceeding'
              : upgrading
              ? 'Updating, please wait...'
              : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeAntModal;
