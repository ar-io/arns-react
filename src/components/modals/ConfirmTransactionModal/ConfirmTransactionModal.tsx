import { useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  PDNT_INTERACTION_TYPES,
  TransactionDataPayload,
  ValidInteractionType,
} from '../../../types';
import {
  TRANSACTION_DATA_KEYS,
  pruneExtraDataFromTransactionPayload,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import TransactionCost from '../../layout/TransactionCost/TransactionCost';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import DialogModal from '../DialogModal/DialogModal';

// TODO: use PDNT_INTERACTION_TYPES to render the correct modal, update the type to that once all flows are implemented

type ConfirmTransactionProps = {
  header: string;
  body: (props: TransactionDataPayload) => JSX.Element;
};

export const CONFIRM_TRANSACTION_PROPS_MAP: Record<
  string,
  ConfirmTransactionProps
> = {
  [PDNT_INTERACTION_TYPES.SET_NAME]: {
    header: 'Edit Nickname',
    body: (props: any) => {
      return (
        <span>
          By completing this action, you are going to change the name of this
          token to <br />
          <span className="text-color-warning">{`"${props?.name}"`}.</span>
        </span>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_TICKER]: {
    header: 'Edit Ticker',
    body: (props: any) => {
      return (
        <span>
          By completing this action, you are going to change the ticker of this
          token to <br />
          <span className="text-color-warning">{`"${props?.ticker}"`}.</span>
        </span>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_TARGET_ID]: {
    header: 'Edit Target ID',
    body: (props: any) => {
      return (
        <span>
          By completing this action, you are going to change the target ID of
          this token to <br />
          <span className="text-color-warning">{`"${props?.target}"`}.</span>
        </span>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_TTL_SECONDS]: {
    header: 'Edit TTL Seconds',
    body: (props: any) => {
      return (
        <span>
          By completing this action, you are going to change the TTL seconds of
          this token to <br />
          <span className="text-color-warning">
            {`"${props?.ttlSeconds}"`}.
          </span>
        </span>
      );
    },
  },
};

function ConfirmTransactionModal({
  interactionType,
  payload,
  assetId,
  close,
  setDeployedTransactionId,
}: {
  interactionType: PDNT_INTERACTION_TYPES;
  payload: TransactionDataPayload;
  assetId: ArweaveTransactionID;
  close: () => void;
  setDeployedTransactionId: (id: ArweaveTransactionID) => void;
}) {
  const [{ walletAddress }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const transactionProps: { title: string; body: JSX.Element } = {
    title: CONFIRM_TRANSACTION_PROPS_MAP[interactionType]?.header,
    body: CONFIRM_TRANSACTION_PROPS_MAP[interactionType]?.body(payload),
  };

  // TODO: add fee for any IO transactions (eg extend lease or increase undernames)
  const [fee] = useState({ io: 0 });
  const [deployingTransaction, setDeployingTransaction] = useState(false);

  async function deployInteraction(
    payload: TransactionDataPayload,
    interactionType: PDNT_INTERACTION_TYPES,
  ) {
    try {
      setDeployingTransaction(true);

      if (!walletAddress) {
        throw Error(
          'Wallet Address is required to deploy transaction, please connect before continuing',
        );
      }
      const functionName =
        TRANSACTION_DATA_KEYS[interactionType as any as ValidInteractionType]
          .functionName;

      const cleanPayload = pruneExtraDataFromTransactionPayload(
        interactionType as any as ValidInteractionType,
        payload,
      );
      const writeInteractionId = await arweaveDataProvider.writeTransaction({
        walletAddress,
        contractTxId: assetId,
        dryWrite: true,
        payload: {
          function: functionName,
          ...cleanPayload,
        },
      });

      if (!writeInteractionId) {
        throw Error('Unable to deploy transaction');
      }
      setDeployedTransactionId(writeInteractionId);
      close();
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setDeployingTransaction(false);
    }
  }

  return (
    <div className="modal-container">
      <DialogModal
        title={<h2 className="white">{transactionProps.title}</h2>}
        body={
          <div
            className="flex flex-column white"
            style={{
              gap: '20px',
              fontSize: '13px',
              padding: '15px 0px',
              lineHeight: '1.5',
              fontWeight: 160,
            }}
          >
            {transactionProps.body}
            <span>Are you sure you want to continue?</span>
          </div>
        }
        onCancel={() => close()}
        onClose={() => close()}
        nextText="Confirm"
        cancelText="Cancel"
        onNext={() => deployInteraction(payload, interactionType)}
        footer={
          <div style={{ width: 'fit-content' }}>
            <TransactionCost fee={fee} showBorder={false} />
          </div>
        }
      />
      {deployingTransaction ? (
        <PageLoader
          loading={true}
          message={`Deploying ${interactionType} interaction, please wait.`}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default ConfirmTransactionModal;
