import { ContractSigner, createAoSigner, evolveANT } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { CloseIcon } from '@src/components/icons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useArNSState, useGlobalState, useWalletState } from '@src/state';
import {
  doAntsRequireUpdate,
  formatForMaxCharCount,
  getAntsRequiringUpdate,
  sleep,
} from '@src/utils';
import { DEFAULT_ANT_LUA_ID, DEFAULT_ARWEAVE } from '@src/utils/constants';
import { fromB64Url } from '@src/utils/encodings';
import eventEmitter from '@src/utils/events';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from 'antd';
import Lottie from 'lottie-react';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import arioLoading from '../../../icons/ario-spinner.json';
import './styles.css';

function UpgradeAntsModal({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) {
  const [{ aoClient }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [accepted, setAccepted] = useState(false);
  const [changelog, setChangelog] = useState('default changelog');
  const [antsToUpgrade, setAntsToUpgrade] = useState<string[]>([]);
  const [{ ants }, dispatchArNSState] = useArNSState();
  // 0 or greater means loading, -1 means not loading
  const [progress, setProgress] = useState(-1);
  const isUpdatingAnts = useCallback(() => progress >= 0, [progress]);
  const { data: luaCodeTx, isLoading } = useQuery({
    queryKey: [DEFAULT_ANT_LUA_ID],
    queryFn: async () => {
      return await DEFAULT_ARWEAVE.transactions.get(DEFAULT_ANT_LUA_ID);
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    const newChanges = luaCodeTx?.tags?.find(
      (tag: any) => fromB64Url(tag.name) === 'Changelog',
    );
    setChangelog(
      newChanges?.value ? fromB64Url(newChanges.value) : 'No changelog found',
    );

    if (luaCodeTx && walletAddress) {
      setAntsToUpgrade(
        getAntsRequiringUpdate({
          ants,
          userAddress: walletAddress.toString(),
          luaSourceTx: luaCodeTx,
        }),
      );
    }
  }, [luaCodeTx, ants]);

  function handleClose() {
    setVisible(false);
    setAccepted(false);
    setProgress(-1);
  }

  async function upgradeAnts() {
    if (isUpdatingAnts()) return;
    try {
      setProgress(0);
      if (!wallet?.arconnectSigner || !walletAddress) {
        throw new Error('No ArConnect Signer found');
      }
      if (!luaCodeTx) {
        throw new Error('No Lua Code Transaction found');
      }

      const antIds = Object.keys(ants).filter((antId) =>
        doAntsRequireUpdate({
          ants: { [antId]: ants[antId] },
          userAddress: walletAddress?.toString(),
          luaSourceTx: luaCodeTx,
        }),
      );

      const signer = createAoSigner(wallet?.arconnectSigner as ContractSigner);
      // deliberately not using concurrency here for UX reasons
      const failedUpgrades = [];
      for (const antId of antIds) {
        await evolveANT({
          processId: antId,
          luaCodeTxId: DEFAULT_ANT_LUA_ID,
          signer,
          ao: aoClient,
        }).catch(() => {
          failedUpgrades.push(antId);
          eventEmitter.emit('error', {
            name: 'Upgrade Error',
            message: `Issue upgrading ANT ${antId}, please try again later`,
          });
        });
        setProgress((prev) => Math.round(prev + 100 / antIds.length));
      }
      if (failedUpgrades.length < antIds.length) {
        eventEmitter.emit('success', {
          message: (
            <div>
              <span>
                Updated {antIds.length - failedUpgrades.length} ANTs to source
                code{' '}
                <ArweaveID
                  characterCount={8}
                  shouldLink={true}
                  type={ArweaveIdTypes.TRANSACTION}
                  id={new ArweaveTransactionID(DEFAULT_ANT_LUA_ID)}
                />
              </span>
            </div>
          ),
          name: `${antIds.length - failedUpgrades.length} of ${
            antIds.length
          } ANTs successfully updated!'`,
        });
      }
      // slight delay for UX so the stage is visible on shorter updates
      await sleep(3000);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      dispatchArNSState({ type: 'refresh', payload: walletAddress! });
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
            {progress < 0 ? (
              <>Upgrade {antsToUpgrade.length} of your ANTs</>
            ) : (
              <>Updating... {progress}%</>
            )}
          </h1>
          <button
            disabled={progress >= 0}
            className="text-md text-white"
            onClick={() => handleClose()}
          >
            <CloseIcon width={'20px'} fill={'white'} />
          </button>
        </div>
        {progress < 0 ? (
          <>
            <div className="flex box-border h-full overflow-hidden w-full flex-col p-4 text-sm text-white">
              <div className="flex scrollbar h-full min-h-[120px] border-b-[1px] border-dark-grey pb-4 mb-4 overflow-y-scroll scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2">
                <ReactMarkdown
                  className={'h-full'}
                  children={
                    changelog
                    //   .padEnd(
                    //   900,
                    //   '1123412342134234123412412341234\n',
                    // )
                  }
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
                        processes to upgrade the code to the latest version
                      </span>
                      <span className="pt-2 text-primary">
                        View the code:{' '}
                        <a
                          className="text-link"
                          href={`https://arscan.io/tx/${DEFAULT_ANT_LUA_ID}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatForMaxCharCount(DEFAULT_ANT_LUA_ID, 8)}
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
                    progress < 0
                      ? 'bg-primary-thin text-primary'
                      : 'bg-link text-white hover:bg-primary hover:text-black'
                  } `
            } w-full rounded-b-lg p-3 transition-all`}
            onClick={() => upgradeAnts()}
          >
            {!accepted && progress < 0
              ? 'Verify you understand before proceeding'
              : progress >= 0
              ? 'Updating, please wait...'
              : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeAntsModal;
