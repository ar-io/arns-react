import Table from 'rc-table';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  useArweaveCompositeProvider,
  useIsMobile,
  useWalletAddress,
} from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  INTERACTION_TYPES,
  ManagePDNTRow,
  TRANSACTION_TYPES,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import { mapTransactionDataKeyToPayload } from '../../../utils';
import { DEFAULT_PDNT_SOURCE_CODE_TX } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { mapKeyToAttribute } from '../../cards/PDNTCard/PDNTCard';
import { CloseIcon, PencilIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import Workflow from '../../layout/Workflow/Workflow';

function CreatePDNTModal() {
  const isMobile = useIsMobile();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{}, dispatchTransactionState] = useTransactionState(); // eslint-disable-line
  const { walletAddress } = useWalletAddress();
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!walletAddress) {
      navigate('/connect', { replace: true });
    }
  }, [walletAddress]);

  const [pdnt, setPDNT] = useState<PDNTContract>(new PDNTContract());

  const [rows, setRows] = useState<[]>([]);
  const [editingField, setEditingField] = useState<string>();
  const [modifiedValue, setModifiedValue] = useState<string | number>();

  const EDITABLE_FIELDS = [
    'name',
    'ticker',
    'targetID',
    'controller',
    'owner',
    'ttlSeconds',
  ];

  const ACTIONABLE_FIELDS: {
    [x: string]: {
      fn: () => void;
      title: TRANSACTION_TYPES;
    };
  } = {
    owner: {
      fn: () => (pdnt.owner = JSON.stringify(modifiedValue)),
      title: TRANSACTION_TYPES.PDNT,
    },
  };

  function reset() {
    setPDNT(new PDNTContract());
    setDetails();
  }
  // reset useEffect must be first, else wont reset
  useEffect(() => {
    reset();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'scroll';
    };
  }, []);

  useEffect(() => {
    if (walletAddress) {
      if (!pdnt.owner) {
        pdnt.owner = walletAddress.toString();
      }
      if (!pdnt.controller) {
        pdnt.controller = walletAddress.toString();
      }
      setDetails();
    }
  }, [walletAddress, pdnt]);

  function setDetails() {
    const consolidatedDetails: any = {
      name: pdnt.name,
      ticker: pdnt.ticker,
      targetID: pdnt.getRecord('@').transactionId,
      ttlSeconds: pdnt.getRecord('@').ttlSeconds,
      controller: pdnt.controller,
      owner: pdnt.owner,
    };

    const rows = Object.keys(consolidatedDetails).reduce(
      (details: any, attribute: string, index: number) => {
        const detail = {
          attribute,
          value: consolidatedDetails[attribute],
          isValid: true,
          editable: EDITABLE_FIELDS.includes(attribute),
          action: ACTIONABLE_FIELDS[attribute],
          key: index,
        };
        details.push(detail);
        return details;
      },
      [],
    );
    setRows(rows);
  }

  function handleStateChange() {
    try {
      if (!modifiedValue) {
        throw new Error('Value is undefined');
      }

      switch (editingField) {
        case 'name':
          pdnt.name = modifiedValue.toString();
          break;
        case 'ticker':
          pdnt.ticker = modifiedValue.toString();
          break;
        case 'owner':
          pdnt.owner = modifiedValue.toString();
          break;
        case 'controller':
          pdnt.controller = modifiedValue.toString();
          break;
        case 'targetID':
          pdnt.records = {
            '@': {
              ...pdnt.getRecord('@'),
              transactionId: modifiedValue.toString(),
            },
          };
          break;
        case 'ttlSeconds':
          pdnt.records = {
            '@': {
              ...pdnt.getRecord('@'),
              ttlSeconds: +modifiedValue,
            },
          };
          break;
        default:
          throw new Error('Editing field not supported');
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditingField(undefined);
      setModifiedValue(undefined);
    }
  }

  function closeModal() {
    reset();
    navigate(state?.from ?? '/');
  }

  return (
    <>
      (
      <div
        className="modal-container flex flex-column center"
        style={{ overflow: 'none' }}
      >
        <button
          className="icon-button"
          style={{
            position: 'absolute',
            top: '2em',
            right: '2em',
            borderRadius: '100%',
          }}
          onClick={() => {
            closeModal();
          }}
        >
          <CloseIcon width={30} height={30} fill={'var(--text-white'} />
        </button>
        <Workflow
          stage={'0'}
          onNext={() => {
            const payload = mapTransactionDataKeyToPayload(
              INTERACTION_TYPES.CREATE,
              [DEFAULT_PDNT_SOURCE_CODE_TX, pdnt.state],
            );
            if (payload) {
              dispatchTransactionState({
                type: 'setInteractionType',
                payload: INTERACTION_TYPES.CREATE,
              });
              dispatchTransactionState({
                type: 'setTransactionData',
                payload: payload,
              });

              navigate(`/transaction`, {
                state: `/create`,
              });
            }
          }}
          onBack={() => navigate(-1)}
          steps={{
            1: {
              title: 'Set PDNT Details',
              status: 'pending',
            },
            2: {
              title: 'Confirm PDNT',
              status: '',
            },
            3: {
              title: 'Deploy PDNT',
              status: '',
            },
            4: {
              title: 'Manage PDNT',
              status: '',
            },
          }}
          stages={{
            0: {
              showNext: true,
              showBack: true,
              backText: 'Cancel',
              customBackStyle: {
                height: '40px',
                width: '150px',
                padding: '5px 10px',
              },
              customNextStyle: {
                height: '40px',
                width: '150px',
                padding: '5px 10px',
              },
              header: (
                <>
                  <div className="flex flex-row text-large white bold center">
                    Create a PDNT
                  </div>
                </>
              ),
              component: (
                <>
                  <div
                    className="flex flex-column card center"
                    style={
                      isMobile
                        ? {
                            width: '95%',
                            height: '75%',
                            position: 'relative',
                          }
                        : {
                            width: '40%',
                            height: 'fit-content',
                            minWidth: '675px',
                            minHeight: '20%',
                            maxHeight: '638px',
                            maxWidth: '1000px',
                            position: 'relative',
                            padding: '.5em 2em',
                          }
                    }
                  >
                    <div className="flex flex-column">
                      <Table
                        showHeader={false}
                        onRow={(row: ManagePDNTRow) => {
                          return {
                            className:
                              row.attribute === editingField
                                ? 'active-row'
                                : '',
                          };
                        }}
                        scroll={{ x: true }}
                        columns={[
                          {
                            title: '',
                            dataIndex: 'attribute',
                            key: 'attribute',
                            align: 'left',
                            width: isMobile ? '0px' : '20%',
                            className: 'white small-row',
                            render: (value: string) => {
                              return `${mapKeyToAttribute(value)}:`;
                            },
                          },
                          {
                            title: '',
                            dataIndex: 'value',
                            key: 'value',
                            align: 'left',
                            className: `white`,
                            width: '40%',
                            render: (value: string | number, row: any) => {
                              if (row.editable)
                                return (
                                  <>
                                    {/* TODO: add label for mobile view */}
                                    <ValidationInput
                                      showValidationIcon={true}
                                      showValidationOutline={true}
                                      inputId={row.attribute + '-input'}
                                      inputType={
                                        row.attribute === 'ttlSeconds'
                                          ? 'number'
                                          : undefined
                                      }
                                      minNumber={100}
                                      maxNumber={1000000}
                                      onClick={() => {
                                        setEditingField(row.attribute);
                                        setModifiedValue(value);
                                      }}
                                      wrapperCustomStyle={{
                                        width:
                                          editingField != row.attribute
                                            ? '175%'
                                            : '125%',
                                        minWidth: '200px',
                                      }}
                                      inputClassName={'flex'}
                                      inputCustomStyle={{
                                        width: '100%',
                                        border: 'none',
                                        overflow: 'hidden',
                                        fontSize: '16px',
                                        outline: 'none',
                                        borderRadius: 'var(--corner-radius)',
                                        background:
                                          editingField === row.attribute
                                            ? 'white'
                                            : 'transparent',
                                        color:
                                          editingField === row.attribute
                                            ? 'black'
                                            : 'white',
                                        padding:
                                          editingField === row.attribute
                                            ? '10px 40px 10px 10px'
                                            : '10px 0px',
                                        display: 'flex',
                                      }}
                                      disabled={editingField !== row.attribute}
                                      placeholder={`Enter a ${mapKeyToAttribute(
                                        row.attribute,
                                      )}`}
                                      value={
                                        editingField === row.attribute
                                          ? modifiedValue
                                          : row.value
                                      }
                                      setValue={(e) => {
                                        if (row.attribute === editingField) {
                                          setModifiedValue(e);
                                        }
                                      }}
                                      validityCallback={(valid: boolean) => {
                                        row.isValid = valid;
                                      }}
                                      validationPredicates={
                                        modifiedValue &&
                                        (row.attribute === 'owner' ||
                                          row.attribute === 'controller' ||
                                          row.attribute === 'targetID')
                                          ? {
                                              [VALIDATION_INPUT_TYPES.ARWEAVE_ID]:
                                                {
                                                  fn: (id: string) =>
                                                    arweaveDataProvider.validateArweaveId(
                                                      id,
                                                    ),
                                                },
                                            }
                                          : {}
                                      }
                                      maxLength={43}
                                    />
                                  </>
                                );
                              return value;
                            },
                          },
                          {
                            title: '',
                            dataIndex: 'action',
                            key: 'action',
                            align: 'right',
                            width: '40%',
                            className: 'white',
                            render: (value: any, row: any) => {
                              //TODO: if it's got an action attached, show it
                              if (row.editable) {
                                return (
                                  <>
                                    {editingField !== row.attribute ? (
                                      <button
                                        onClick={() => {
                                          setModifiedValue(undefined);
                                          setEditingField(row.attribute);
                                        }}
                                      >
                                        <PencilIcon
                                          style={{
                                            width: '24px',
                                            height: '24px',
                                            fill: 'white',
                                          }}
                                        />
                                      </button>
                                    ) : (
                                      <div
                                        className="flex flex-right"
                                        style={{ gap: '0.5em', padding: '0px' }}
                                      >
                                        <button
                                          className="flex center assets-manage-button"
                                          style={{
                                            backgroundColor: 'transparent',
                                            color: 'white',
                                          }}
                                          onClick={() => {
                                            setModifiedValue(undefined);
                                            setEditingField(undefined);
                                          }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          className="flex center assets-manage-button"
                                          style={{
                                            backgroundColor: 'var(--accent)',
                                            borderColor: 'var(--accent)',
                                          }}
                                          onClick={() => {
                                            if (!modifiedValue || row.isValid) {
                                              row.value = modifiedValue;
                                              handleStateChange();
                                            }
                                          }}
                                        >
                                          Save
                                        </button>
                                      </div>
                                    )}
                                  </>
                                );
                              }
                              if (row.action) {
                                return (
                                  <button
                                    onClick={row.action.fn}
                                    className="assets-manage-button"
                                  >
                                    {row.action.title}
                                  </button>
                                );
                              }
                              return value;
                            },
                          },
                        ]}
                        data={rows}
                      />
                    </div>
                    {/* card div end */}
                  </div>
                </>
              ),
            },
          }}
        />
        {/* workflow end */}
      </div>
      )
    </>
  );
}

export default CreatePDNTModal;
