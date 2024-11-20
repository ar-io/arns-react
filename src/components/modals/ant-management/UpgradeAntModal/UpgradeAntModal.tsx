import { ContractSigner, createAoSigner, evolveANT } from '@ar.io/sdk';
import AntChangelog from '@src/components/cards/AntChangelog';
import { Tooltip } from '@src/components/data-display';
import { CloseIcon } from '@src/components/icons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useArNSState, useGlobalState, useWalletState } from '@src/state';
import { dispatchANTUpdate } from '@src/state/actions/dispatchANTUpdate';
import { formatForMaxCharCount, sleep } from '@src/utils';
import { DEFAULT_ANT_LUA_ID } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from 'antd';
import Lottie from 'lottie-react';
import { useState } from 'react';

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
  const queryClient = useQueryClient();
  const [{ aoClient }] = useGlobalState();
  const [, dispatchArNSState] = useArNSState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [accepted, setAccepted] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  function handleClose() {
    setVisible(false);
    setAccepted(false);
    setUpgrading(false);
  }

  async function upgradeAnts() {
    try {
      if (!wallet?.contractSigner || !walletAddress) {
        throw new Error('No ArConnect Signer found');
      }

      setUpgrading(true);

      const signer = createAoSigner(wallet?.contractSigner as ContractSigner);
      // deliberately not using concurrency here for UX reasons
      const failedUpgrades = [];

      await evolveANT({
        processId: antId,
        luaCodeTxId: DEFAULT_ANT_LUA_ID,
        signer,
        ao: aoClient,
      }).catch(() => {
        failedUpgrades.push(antId);
      });
      dispatchANTUpdate({
        processId: antId,
        queryClient,
        walletAddress,
        dispatch: dispatchArNSState,
      });
      queryClient.invalidateQueries(
        {
          queryKey: ['handlers'],
          refetchType: 'all',
          exact: false,
        },
        { cancelRefetch: true },
      );
      queryClient.invalidateQueries(
        {
          queryKey: ['domainInfo'],
          refetchType: 'all',
          exact: false,
        },
        { cancelRefetch: true },
      );

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
                  id={new ArweaveTransactionID(DEFAULT_ANT_LUA_ID)}
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

  return (
    <div className="modal-container items-center justify-center">
      <div className="flex h-fit max-h-[40rem] w-[35rem]  justify-between flex-col rounded-lg bg-foreground shadow-one">
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
              <div className="flex scrollbar h-full min-h-[7.5rem] border-b-[1px] border-dark-grey pb-4 mb-4 overflow-y-scroll scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2">
                <AntChangelog />
              </div>

              <span
                className="flex flex-row items-center text-base py-4"
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
                    !upgrading
                      ? 'bg-primary-thin text-primary'
                      : 'bg-link text-white hover:bg-primary hover:text-black'
                  } `
            } w-full rounded-b-lg p-4 text-base transition-all`}
            onClick={() => upgradeAnts()}
          >
            {!accepted
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
