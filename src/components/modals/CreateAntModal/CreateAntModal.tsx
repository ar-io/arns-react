import Table from 'rc-table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { ANTContract } from '../../../services/arweave/AntContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ANTContractJSON,
  ANT_INTERACTION_TYPES,
  ArweaveTransactionID,
  CONTRACT_TYPES,
  ManageAntRow,
  TRANSACTION_TYPES,
  TransactionData,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  DEFAULT_ANT_SOURCE_CODE_TX,
  STUB_ARWEAVE_TXID,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { mapKeyToAttribute } from '../../cards/AntCard/AntCard';
import { CloseIcon, PencilIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import ConfirmAntCreation from '../../layout/ConfirmAntCreation/ConfirmAntCreation';
import DeployTransaction from '../../layout/DeployTransaction/DeployTransaction';
import TransactionComplete from '../../layout/TransactionComplete/TransactionComplete';
import Workflow from '../../layout/Workflow/Workflow';

function CreateAntModal() {
  const isMobile = useIsMobile();
  const [{ arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletAddress) {
      // TODO: use previous location instead
      navigate('/connect', { replace: true });
    }
  }, [walletAddress]);

  const [ant, setAnt] = useState<ANTContract>(new ANTContract());

  const [rows, setRows] = useState<[]>([]);
  const [editingField, setEditingField] = useState<string>();
  const [modifiedValue, setModifiedValue] = useState<string | number>();

  const [workflowStage, setWorkflowStage] = useState<number>(0);

  const [antContractId, setAntContractId] = useState<
    ArweaveTransactionID | undefined
  >();
  const [isPostingTransaction, setIsPostingTransaction] = useState(false);

  const steps = {
    1: {
      title: 'Set ANT Details',
      status:
        workflowStage + 1 === 1
          ? 'pending'
          : workflowStage + 1 > 1
          ? 'success'
          : '',
    },
    2: {
      title: 'Confirm ANT',
      status:
        workflowStage + 1 === 2
          ? 'pending'
          : workflowStage + 1 > 2
          ? 'success'
          : '',
    },
    3: {
      title: 'Deploy ANT',
      status:
        workflowStage + 1 === 3
          ? 'pending'
          : workflowStage + 1 > 3
          ? 'success'
          : '',
    },
    4: {
      title: 'Manage ANT',
      status: workflowStage + 1 === 4 ? 'success' : '',
    },
  };
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
      fn: () => (ant.owner = JSON.stringify(modifiedValue)),
      title: TRANSACTION_TYPES.ANT,
    },
  };

  function reset() {
    setWorkflowStage(0);
    setAnt(new ANTContract());
    setIsPostingTransaction(false);
    setAntContractId(undefined);
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
      if (!ant.owner) {
        ant.owner = walletAddress.toString();
      }
      if (!ant.controller) {
        ant.controller = walletAddress.toString();
      }
      setDetails();
    }
  }, [walletAddress, ant, workflowStage]);

  function setDetails() {
    //  eslint-disable-next-line

    const consolidatedDetails: any = {
      name: ant.name,
      ticker: ant.ticker,
      targetID: ant.records['@'].transactionId,
      ttlSeconds: ant.records['@'].ttlSeconds?.toString(),
      controller: ant.controller,
      owner: ant.owner,
    };

    const rows = Object.keys(consolidatedDetails).reduce(
      (details: any, attribute: string, index: number) => {
        const detail = {
          attribute,
          value: consolidatedDetails[attribute],
          isValid: undefined,
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
          ant.name = modifiedValue.toString();
          break;
        case 'ticker':
          ant.ticker = modifiedValue.toString();
          break;
        case 'owner':
          ant.owner = modifiedValue.toString();
          break;
        case 'controller':
          ant.controller = modifiedValue.toString();
          break;
        case 'targetID':
          ant.records = {
            '@': {
              ...ant.records['@'],
              transactionId: modifiedValue.toString(),
            },
          };
          break;
        case 'ttlSeconds':
          ant.records = {
            '@': {
              ...ant.records['@'],
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

  async function deployAnt(state: ANTContractJSON) {
    try {
      setIsPostingTransaction(true);
      if (!state) {
        throw new Error('No state provided, cannot deploy ANT contract');
      }
      // perform checks, try/catch
      const pendingTXId = await arweaveDataProvider.deployContract({
        srcCodeTransactionId: new ArweaveTransactionID(
          DEFAULT_ANT_SOURCE_CODE_TX,
        ),
        initialState: state,
      });
      if (!pendingTXId) {
        throw new Error('Failed to deploy ANT contract');
      }
      setAntContractId(new ArweaveTransactionID(pendingTXId));
      setIsPostingTransaction(false);
      return pendingTXId;
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setIsPostingTransaction(false);
    }
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
            reset();
            navigate(-1);
          }}
        >
          <CloseIcon width={30} height={30} fill={'var(--text-white'} />
        </button>
        <Workflow
          stage={workflowStage.toString()}
          onNext={() => {
            switch (workflowStage) {
              case 0:
                setWorkflowStage(workflowStage + 1);
                if (!ant.records['@'].transactionId) {
                  ant.records = {
                    ...ant.records,
                    '@': {
                      transactionId: STUB_ARWEAVE_TXID,
                      ttlSeconds: undefined,
                      maxSubdomains: undefined,
                    },
                  };
                }
                break;
              case 1:
                {
                  if (ant.state) {
                    setWorkflowStage(workflowStage + 1);
                    deployAnt(ant.state)
                      .then(() => {
                        setWorkflowStage(workflowStage + 2);
                        steps['3'].status = 'fail';
                      })
                      .catch(() => {
                        setWorkflowStage(workflowStage + 2);
                        steps['3'].status = 'fail';
                      });
                  }
                  if (!ant.state) {
                    return;
                  }
                }
                break;
              default:
                return;
            }
          }}
          onBack={() => {
            switch (workflowStage) {
              case 0:
                navigate(-1);
                break;
              default:
                setWorkflowStage(workflowStage - 1);
                break;
            }
          }}
          steps={steps}
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
                    Create an ANT
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
                        onRow={(row: ManageAntRow) => {
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
                                      validationPredicates={
                                        row.attribute === 'owner' ||
                                        row.attribute === 'controller' ||
                                        row.attribute === 'targetID'
                                          ? {
                                              [VALIDATION_INPUT_TYPES.ARWEAVE_ID]:
                                                (id: string) =>
                                                  arweaveDataProvider.validateArweaveId(
                                                    id,
                                                  ),
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
                                            width: '24',
                                            height: '24',
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
                                            row.value = modifiedValue;
                                            handleStateChange();
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
            1: {
              nextText: 'Confirm',
              customBackStyle: {
                height: '40px',
                width: '150px',
                padding: '5px 10px',
              },
              customNextStyle: {
                height: '40px',
                width: '150px',
                padding: '5px 10px',
                backgroundColor: !ant.state
                  ? 'var(--text-faded)'
                  : 'var(--accent)',
              },
              header: (
                <>
                  <div className="flex flex-row text-large white bold center">
                    Confirm ANT Creation
                  </div>
                </>
              ),
              component: (
                <>
                  <ConfirmAntCreation state={ant.state} />
                </>
              ),
            },
            2: {
              showBack: false,
              showNext: false,
              header: (
                <>
                  {' '}
                  <span className="flex flex-row text-large white bold center">
                    {isPostingTransaction
                      ? 'Deploying...'
                      : 'Awaiting transaction confirmation...'}
                  </span>
                </>
              ),
              component: (
                <>
                  <DeployTransaction />
                </>
              ),
            },
            3: {
              showBack: false,
              showNext: false,
              header: (
                <>
                  <span className="flex flex-row text-large white bold center">
                    ANT successfully created!
                  </span>
                </>
              ),
              component: (
                <>
                  <TransactionComplete
                    transactionId={
                      antContractId
                        ? new ArweaveTransactionID(antContractId.toString())
                        : undefined
                    }
                    contractType={CONTRACT_TYPES.ANT}
                    interactionType={ANT_INTERACTION_TYPES.CREATE}
                    transactionData={
                      {
                        initialState: ant.state,
                        srcCodeTransactionId: DEFAULT_ANT_SOURCE_CODE_TX,
                      } as TransactionData
                    }
                  />
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

export default CreateAntModal;
