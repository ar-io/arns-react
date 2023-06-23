import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  INTERACTION_TYPES,
  PDNTContractJSON,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  getAssociatedNames,
  mapTransactionDataKeyToPayload,
} from '../../../utils';
import { SMARTWEAVE_TAG_SIZE } from '../../../utils/constants';
import { AlertTriangleIcon } from '../../icons';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import ArPrice from '../../layout/ArPrice/ArPrice';

function TransferPDNTModal({
  pdntId,
  showModal,
}: {
  pdntId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  showModal: () => void;
}) {
  const [{ pdnsSourceContract }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [, dispatchTransactionState] = useTransactionState();
  const isMobile = useIsMobile();
  const [accepted, setAccepted] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [state, setState] = useState<PDNTContractJSON>();
  const [associatedNames] = useState(() =>
    getAssociatedNames(pdntId, pdnsSourceContract.records),
  );
  const navigate = useNavigate();

  // TODO: add "transfer to another account" dropdown

  useEffect(() => {
    arweaveDataProvider
      .getContractState(pdntId)
      .then((res) => setState(res as PDNTContractJSON));
  }, [pdntId]);

  if (!state) {
    return (
      <div className="modal-container">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <>
      <div
        className="modal-container"
        style={isMobile ? { padding: 'none' } : {}}
      >
        {/**modal header */}
        <div
          className="flex flex-column card"
          style={
            isMobile
              ? {
                  width: '95%',
                  maxWidth: 'none',
                  height: '95%',
                  padding: 0,
                  boxSizing: 'border-box',
                  gap: '10px',
                  position: 'relative',
                  paddingBottom: 85,
                  justifyContent: 'space-between',
                }
              : {
                  width: 420,
                  minHeight: 200,
                  padding: 0,
                  paddingBottom: 75,
                  gap: '1em',
                  position: 'relative',
                }
          }
        >
          <div
            className="flex flex-column flex-space-between"
            style={{
              padding: '15px 0px 0px 15px',
              boxSizing: 'border-box',
              marginTop: 5,
              gap: '.5em',
              position: 'relative',
            }}
          >
            <span
              className="text-medium white bold flex flex-column"
              style={{
                gap: 0,
              }}
            >
              Transfer&nbsp;{state.name.length ? state.name : ''}&nbsp;
              {state.ticker.length ? `(${state.ticker})` : ''}
            </span>

            <span className="flex grey text" style={{ alignItems: 'center' }}>
              Contract ID:&nbsp;
              <CopyTextButton
                copyText={pdntId.toString()}
                displayText={`${pdntId.toString().slice(0, isMobile ? 6 : 0)}${
                  isMobile ? '...' : ''
                }${pdntId.toString().slice(isMobile ? -6 : 0)}`}
                size={'70%'}
                wrapperStyle={{
                  fontFamily: 'Rubik-Bold',
                  fontSize: '10px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                position="relative"
              />
            </span>
          </div>
          {/** modal body - condition render edit or transfer */}

          <div
            className="flex flex-column"
            style={{
              width: '90%',
              height: '100%',
              gap: '1em',
            }}
          >
            {/* todo: show 'transfer between accounts' option */}

            <ValidationInput
              inputClassName="data-input center"
              inputCustomStyle={{ paddingRight: '30px' }}
              showValidationIcon={true}
              showValidationOutline={true}
              placeholder="Enter recipients address"
              maxLength={43}
              value={toAddress}
              setValue={setToAddress}
              validityCallback={(validity: boolean) =>
                setIsValidAddress(validity)
              }
              validationPredicates={{
                [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                  fn: (id: string) => arweaveDataProvider.validateArweaveId(id),
                },
                [VALIDATION_INPUT_TYPES.ARWEAVE_ADDRESS]: {
                  fn: (id: string) =>
                    arweaveDataProvider.validateArweaveAddress(id),
                  required: false,
                },
              }}
            />
            {associatedNames.length ? (
              <span
                className="flex flex-row"
                style={{
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <AlertTriangleIcon
                  width={20}
                  height={20}
                  fill={'var(--accent)'}
                />
                <span
                  className="text grey"
                  style={{ textAlign: 'left', width: '90%' }}
                >
                  {`This ANT has ${associatedNames.length} name(s) that are associated with it. By transferring this ANT, you
                  will also be transferring control of those names to the new
                  ANT holder.`}
                </span>
              </span>
            ) : (
              <></>
            )}
          </div>
          <div
            className="flex flex-column center"
            style={{ width: '90%', gap: 0 }}
          >
            <span
              className="flex flex-row text white"
              style={{
                gap: 10,
                alignItems: 'center',
              }}
            >
              <input
                type="checkbox"
                className="accept-terms"
                checked={accepted}
                onClick={() => setAccepted(!accepted)}
              />
              I understand that this action cannot be undone.
            </span>

            <div
              className="flex flex-row flex-space-between"
              style={{
                position: 'absolute',
                width: '100%',
                borderTop: '2px #323232 solid',
                boxSizing: 'border-box',
                padding: '15px',
                bottom: 0,
              }}
            >
              {/* Footer */}
              {/* Price / error */}
              {/* TODO add address validation (check an id is an arweave address or transaction) */}
              <div
                className="text white flex flex-column left"
                style={{ gap: 0 }}
              >
                <span>This transaction will cost</span>
                <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
              </div>

              {/* buttontainer */}
              <div
                className="flex flex-row"
                style={{ gap: '5px', width: 'fit-content' }}
              >
                <button
                  className="outline-button center"
                  style={{ width: '65px', height: '30px', fontSize: '12px' }}
                  onClick={() => showModal()}
                >
                  Cancel
                </button>
                {(accepted && !isValidAddress) || !accepted ? (
                  <Tooltip
                    title={
                      !accepted
                        ? 'Must accept to continue'
                        : 'Not a valid address format, fix errors to continue'
                    }
                    placement="bottom"
                  >
                    <button
                      className="accent-button center flex flex-row"
                      style={{
                        width: '65px',
                        height: '30px',
                        fontSize: '12px',
                        backgroundColor: 'var(--text-grey)',
                      }}
                    >
                      Next
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    className="accent-button center flex flex-row"
                    style={{ width: '65px', height: '30px', fontSize: '12px' }}
                    onClick={() => {
                      const payload = mapTransactionDataKeyToPayload(
                        INTERACTION_TYPES.TRANSFER,
                        [toAddress?.toString(), 1],
                      );

                      if (payload) {
                        dispatchTransactionState({
                          type: 'setInteractionType',
                          payload: INTERACTION_TYPES.TRANSFER,
                        });
                        dispatchTransactionState({
                          type: 'setTransactionData',
                          payload: {
                            ...payload,
                            assetId: pdntId?.toString(),
                          },
                        });
                        navigate(`/transaction`, {
                          state: `/manage/ants/${pdntId?.toString()}`,
                        });
                      }
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransferPDNTModal;
