import Table from 'rc-table';
import { useEffect, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { ANTContract } from '../../../services/arweave/AntContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  AntInteractionProvider,
  ManageAntRow,
  TRANSACTION_TYPES,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  DEFAULT_ATTRIBUTES,
  mapKeyToAttribute,
} from '../../cards/AntCard/AntCard';
import { CloseIcon, NotebookIcon, PencilIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import ConfirmRegistration from '../../layout/ConfirmRegistration/ConfirmRegistration';
import Workflow from '../../layout/Workflow/Workflow';

function Create() {
  const isMobile = useIsMobile();
  const [{ arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  const [ant, setAnt] = useState<ANTContract>(new ANTContract());
  const [stateValid, setStateValid] = useState(true);

  const [rows, setRows] = useState<[]>([]);
  const [editingField, setEditingField] = useState<string>();
  const [modifiedValue, setModifiedValue] = useState<string | number>();

  const [workflowStage, setWorkflowStage] = useState(0);

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
  }, [walletAddress, ant]);

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

      if (editingField == 'name') {
        ant.name = modifiedValue.toString();
      }
      if (editingField == 'ticker') {
        ant.ticker = modifiedValue.toString();
      }
      if (editingField == 'owner') {
        ant.owner = modifiedValue.toString();
      }
      if (editingField == 'controller') {
        ant.controller = modifiedValue.toString();
      }
      if (editingField == 'targetID') {
        ant.records = {
          '@': {
            transactionId: modifiedValue.toString(),
          },
        };
      }
      if (editingField == 'ttlSeconds' && typeof modifiedValue === 'number') {
        ant.records = {
          '@': {
            ttlSeconds: modifiedValue,
          },
        };
      }
      setEditingField(undefined);
      setModifiedValue(undefined);
    } catch (error) {
      console.error(error);
      setEditingField(undefined);
      setModifiedValue(undefined);
    }
  }

  return (
    <>
      <div
        className="page flex flex-column center"
        style={{
          boxSizing: 'border-box',
          height: '100%',
        }}
      >
        <Workflow
          stage={workflowStage}
          onNext={() => setWorkflowStage(workflowStage + 1)}
          onBack={() => setWorkflowStage(workflowStage - 1)}
          stages={{
            0: {
              showNext: true,
              showBack: false,
              component: (
                <>
                  <div className="flex flex-row text-large white bold center">
                    Create an ANT
                  </div>
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
                            width: '75%',
                            height: '50%',
                            maxHeight: '638px',
                            maxWidth: '1000px',
                            position: 'relative',
                          }
                    }
                  >
                    {/* todo: implement validation input */}
                    <div className="flex flex-column">
                      <Table
                        showHeader={false}
                        onRow={(row: ManageAntRow) => ({
                          className:
                            row.attribute === editingField ? 'active-row' : '',
                        })}
                        scroll={{ x: true }}
                        columns={[
                          {
                            title: '',
                            dataIndex: 'attribute',
                            key: 'attribute',
                            align: 'left',
                            width: isMobile ? '0px' : '30%',
                            className: 'white',
                            render: (value: string) => {
                              return `${mapKeyToAttribute(value)}:`;
                            },
                          },
                          {
                            title: '',
                            dataIndex: 'value',
                            key: 'value',
                            align: 'left',
                            width: '80%',
                            className: 'white',
                            render: (value: string | number, row: any) => {
                              if (row.editable)
                                return (
                                  <>
                                    {/* TODO: add label for mobile view */}
                                    <ValidationInput
                                      inputId={row.attribute}
                                      inputCustomStyle={{
                                        width: '90%',
                                        fontSize: '16px',
                                        background:
                                          editingField === row.attribute
                                            ? 'white'
                                            : 'transparent',
                                        border:
                                          stateValid &&
                                          editingField === row.attribute
                                            ? 'solid 2px var(--success-green)'
                                            : !stateValid &&
                                              editingField === row.attribute
                                            ? 'solid 2px var(--error-red)'
                                            : 'none',
                                        borderRadius: '2px',
                                        color:
                                          editingField === row.attribute
                                            ? 'black'
                                            : 'white',
                                        padding:
                                          editingField === row.attribute
                                            ? '10px '
                                            : '10px 0px',
                                        display: 'block',
                                      }}
                                      disabled={editingField !== row.attribute}
                                      placeholder={`Enter a ${mapKeyToAttribute(
                                        row.attribute,
                                      )}`}
                                      value={
                                        editingField !== row.attribute
                                          ? row.value
                                          : modifiedValue
                                      }
                                      setValue={(e) => {
                                        setModifiedValue(e);
                                        row.value = e;
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
                                          : {
                                              [VALIDATION_INPUT_TYPES.UNDERNAME]:
                                                (value: string) => {
                                                  return new Promise(
                                                    (resolve) => {
                                                      resolve(value);
                                                    },
                                                  );
                                                },
                                            }
                                      }
                                      maxLength={43}
                                      setIsValid={(b: boolean) =>
                                        setStateValid(b)
                                      }
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
                            width: '10%',
                            align: 'right',
                            className: 'white',
                            render: (value: any, row: any) => {
                              //TODO: if it's got an action attached, show it
                              if (row.editable) {
                                return (
                                  <>
                                    {editingField !== row.attribute ? (
                                      <button
                                        onClick={() => {
                                          setEditingField(row.attribute);
                                          setModifiedValue(row.value);
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
                                      <button
                                        className="assets-manage-button"
                                        style={{
                                          backgroundColor: 'var(--accent)',
                                          borderColor: 'var(--accent)',
                                        }}
                                        onClick={() => {
                                          handleStateChange();
                                        }}
                                      >
                                        Save
                                      </button>
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
              component: (
                <>
                  <ConfirmRegistration />
                </>
              ),
            },
          }}
        />
        {/* workflow end */}
      </div>
    </>
  );
}

export default Create;
