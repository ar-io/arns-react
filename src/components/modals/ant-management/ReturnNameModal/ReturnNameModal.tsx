import { connect } from '@permaweb/aoconnect';
import WarningCard from '@src/components/cards/WarningCard/WarningCard';
import { Tooltip } from '@src/components/data-display';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { ANT_INTERACTION_TYPES } from '@src/types';
import { encodeDomainToASCII, lowerCaseDomain, sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { Checkbox } from 'antd';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import DialogModal from '../../DialogModal/DialogModal';

export function ReturnNameModal({
  show,
  setShow,
  processId,
  name,
}: {
  show: boolean;
  setShow: (b: boolean) => void;
  processId: string;
  name: string;
}) {
  const [{ ioProcessId, arioContract, aoNetwork }] = useGlobalState();
  const [{ arnsEmitter }, dispatchArNSState] = useArNSState();
  const [{ signing }, dispatchTransactionState] = useTransactionState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [accepted, setAccepted] = useState(false);

  async function handleReturn() {
    let released = undefined;
    let releasedTimeout: NodeJS.Timeout | undefined = undefined;
    try {
      dispatchTransactionState({
        type: 'setSigningMessage',
        payload: `Releasing ${encodeDomainToASCII(name)}`,
      });
      dispatchTransactionState({ type: 'setSigning', payload: true });
      if (!wallet?.contractSigner) {
        throw new Error('No ArConnect Signer found');
      }
      if (!walletAddress) throw new Error('Must connect to release the ANT');

      const aoClient = connect(aoNetwork);

      const tx = await dispatchANTInteraction({
        signer: wallet.contractSigner,
        payload: {
          name,
          ioProcessId,
        },
        processId,
        workflowName: ANT_INTERACTION_TYPES.RELEASE_NAME,
        dispatch: dispatchTransactionState,
        owner: walletAddress.toString(),
      });

      await aoClient.result({ message: tx.id, process: processId });

      releasedTimeout = setTimeout(() => {
        released = false;
      }, 10_000);

      dispatchTransactionState({
        type: 'setSigningMessage',
        payload: `Verifying ${encodeDomainToASCII(name)} release`,
      });

      while (released !== false) {
        await sleep(3000);
        const record = await arioContract
          .getArNSRecord({
            name: lowerCaseDomain(name),
          })
          .catch((e) => {
            console.error(e);
            return new Error(e.message);
          });
        if (!(record instanceof Error) && record?.processId !== processId) {
          released = true;
        }
      }
      if (!released) {
        eventEmitter.emit('error', new Error('Name return failed'));
      } else {
        eventEmitter.emit(
          'success',
          <span
            className="flex flex-row whitespace-nowrap"
            style={{ gap: '10px' }}
          >
            Name return complete. Transaction ID:{' '}
            <ArweaveID
              id={new ArweaveTransactionID(tx.id)}
              type={ArweaveIdTypes.INTERACTION}
              shouldLink
              characterCount={8}
            />
          </span>,
        );
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      if (releasedTimeout) clearTimeout(releasedTimeout);
      if (walletAddress) {
        dispatchArNSUpdate({
          walletAddress: walletAddress,
          ioProcessId,
          dispatch: dispatchArNSState,
          emitter: arnsEmitter,
        });
      }
      dispatchTransactionState({ type: 'setSigning', payload: false });
      dispatchTransactionState({
        type: 'setSigningMessage',
        payload: undefined,
      });
    }
  }

  if (!show) return <></>;

  return (
    <div className="modal-container">
      <DialogModal
        title={<h1 className="text-2xl text-white">Permanent Name Return</h1>}
        body={
          <div className="flex flex-col text-white max-w-[32rem] max-h-[40rem] gap-8">
            <span>
              You are about to return your permanently registered name back to
              the protocol. Once completed:
            </span>
            <ul className="flex flex-col gap-2 pl-6 list-disc">
              <li>
                The name will enter the Return Initiated Dutch Auction process
                and become available for public re-registration.
              </li>
              <li>
                You will no longer have ownership or control over this name.
              </li>
              <li>
                If repurchased during the auction, you will receive a portion of
                the proceeds based on the outcome.
              </li>
            </ul>

            <WarningCard
              customIcon={<TriangleAlert />}
              text={
                <div className="flex flex-row size-full">
                  <span>
                    Be sure that you no longer need this name or its associated
                    features before proceeding.{' '}
                    <span className="text-bold">
                      This action is irreversible.
                    </span>
                  </span>
                </div>
              }
            />
            <span
              className="flex flex-row text-grey items-center text-base py-4"
              style={{ gap: '10px' }}
            >
              <Checkbox
                rootClassName="accept-checkbox"
                onChange={(checked) => setAccepted(checked.target.checked)}
                value={accepted}
              />
              I understand that this action cannot be undone{' '}
              <Tooltip
                message={
                  <div className="flex flex-col">
                    You are about to return your permanently registered name
                    back to the protocol. This action is irreversible.
                  </div>
                }
              />
            </span>
            <span>Do you wish to continue with the name return?</span>
          </div>
        }
        cancelText="Cancel"
        nextText="Confirm"
        onCancel={!signing ? () => setShow(false) : undefined}
        onClose={!signing ? () => setShow(false) : undefined}
        onNext={accepted ? () => handleReturn() : undefined}
      />
    </div>
  );
}
