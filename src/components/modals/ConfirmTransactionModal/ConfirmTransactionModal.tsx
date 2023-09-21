import { useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  INTERACTION_TYPES,
  PDNT_INTERACTION_TYPES,
  RemoveRecordPayload,
  SetControllerPayload,
  SetNamePayload,
  SetRecordPayload,
  SetTickerPayload,
  TransactionData,
  TransactionDataPayload,
  TransferANTPayload,
  ValidInteractionType,
} from '../../../types';
import {
  TRANSACTION_DATA_KEYS,
  getPDNSMappingByInteractionType,
  isObjectOfTransactionPayloadType,
  pruneExtraDataFromTransactionPayload,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import { PDNTCard } from '../../cards';
import TransactionCost from '../../layout/TransactionCost/TransactionCost';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import DialogModal from '../DialogModal/DialogModal';

type ConfirmTransactionProps = {
  header: string;
  successHeader: string;
  body: (props: TransactionData) => JSX.Element;
};

export const CONFIRM_TRANSACTION_PROPS_MAP: Record<
  PDNT_INTERACTION_TYPES,
  ConfirmTransactionProps
> = {
  [PDNT_INTERACTION_TYPES.SET_NAME]: {
    header: 'Edit Nickname',
    successHeader: 'Edit Nickname completed',
    body: (props: TransactionData) => {
      if (
        !isObjectOfTransactionPayloadType<SetNamePayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_NAME].keys,
        )
      ) {
        return <></>;
      }

      return (
        <>
          <span>
            By completing this action, you are going to change the name of this
            token to <br />
            <span className="text-color-warning">{`"${props.name}"`}.</span>
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_TICKER]: {
    header: 'Edit Ticker',
    successHeader: 'Edit Ticker completed',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<SetTickerPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_TICKER].keys,
        )
      ) {
        return <></>;
      }
      return (
        <>
          <span>
            By completing this action, you are going to change the ticker of
            this token to <br />
            <span className="text-color-warning">{`"${props.ticker}"`}.</span>
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_TARGET_ID]: {
    header: 'Edit Target ID',
    successHeader: 'Edit Target ID completed',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<SetRecordPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_RECORD].keys,
        )
      ) {
        return <></>;
      }
      return (
        <>
          <span>
            By completing this action, you are going to change the target ID of
            this token to <br />
            <span className="text-color-warning">
              {`"${props.transactionId}"`}.
            </span>
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_TTL_SECONDS]: {
    header: 'Edit TTL Seconds',
    successHeader: 'Edit ttlSeconds completed',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<SetRecordPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_TTL_SECONDS].keys,
        )
      ) {
        return <></>;
      }
      return (
        <>
          <span>
            By completing this action, you are going to change the TTL seconds
            of this token to <br />
            <span className="text-color-warning">
              {`"${props.ttlSeconds}"`}.
            </span>
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_CONTROLLER]: {
    header: 'Add Controllers',
    successHeader: 'Controller Added',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<SetControllerPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_CONTROLLER].keys,
        )
      ) {
        return <></>;
      }
      return (
        <>
          <span>
            By completing this action, you are going to add controller with the
            wallet ID <br />
            <span className="text-color-warning">{`"${props.target}"`}.</span>
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.REMOVE_CONTROLLER]: {
    header: 'Remove Controller',
    successHeader: 'Controllers Removed',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<SetControllerPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.REMOVE_CONTROLLER].keys,
        )
      ) {
        return <></>;
      }
      return (
        <>
          <span>
            By completing this action, you are going to remove
            <span className="text-color-warning">{`"${props.target}"`}</span>
            controllers.
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.REMOVE_RECORD]: {
    header: 'Remove Undername',
    successHeader: 'Undername Removed',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<RemoveRecordPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.REMOVE_RECORD].keys,
        )
      ) {
        return <></>;
      }
      return (
        <>
          <span>
            By completing this action, you are going to remove
            <span className="text-color-warning">
              {`"${props.subDomain}"`}.
            </span>
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.SET_RECORD]: {
    header: 'Add Undername',
    successHeader: 'Undername Added',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<SetRecordPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_TTL_SECONDS].keys,
        )
      ) {
        return <></>;
      }
      return (
        <>
          <span>
            By completing this action, you are going to add
            <span className="text-color-warning">{`"${props.ttlSeconds}"`}</span>{' '}
            undername with{' '}
            <span className="text-color-warning">{`"${props.ttlSeconds}"`}</span>{' '}
            target ID.
          </span>
          <span>Are you sure you want to continue?</span>
        </>
      );
    },
  },
  [PDNT_INTERACTION_TYPES.TRANSFER]: {
    header: 'Review Transfer',
    successHeader: 'Transfer completed',
    body: (props: TransactionDataPayload) => {
      if (
        !isObjectOfTransactionPayloadType<TransferANTPayload>(
          props,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.TRANSFER].keys,
        )
      ) {
        return <></>;
      }
      const pdntProps = getPDNSMappingByInteractionType({
        interactionType: INTERACTION_TYPES.TRANSFER,
        transactionData: { ...props } as unknown as TransactionData,
      });

      return (
        <span className="flex" style={{ maxWidth: '500px' }}>
          <PDNTCard
            {...pdntProps}
            domain={props.associatedNames?.[0] ?? ''}
            mobileView
          />
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
    title: CONFIRM_TRANSACTION_PROPS_MAP[interactionType].header,
    body: CONFIRM_TRANSACTION_PROPS_MAP[interactionType].body({
      ...payload,
      assetId: assetId.toString(),
      functionName: '',
    }),
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
          </div>
        }
        onCancel={() => close()}
        onClose={() => close()}
        nextText="Confirm"
        cancelText="Cancel"
        onNext={() => deployInteraction(payload, interactionType)}
        footer={
          <div style={{ width: 'fit-content' }}>
            <TransactionCost
              fee={fee}
              showBorder={false}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
            />
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
