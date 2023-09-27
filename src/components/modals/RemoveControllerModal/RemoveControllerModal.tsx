import { Checkbox, Table } from 'antd';
import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  RemoveControllerPayload,
} from '../../../types';
import {
  formatForMaxCharCount,
  getCustomPaginationButtons,
  getLegacyControllersFromState,
} from '../../../utils';
import { Loader } from '../../layout';
import TransactionCost from '../../layout/TransactionCost/TransactionCost';
import DialogModal from '../DialogModal/DialogModal';
import './styles.css';

function RemoveControllersModal({
  antId,
  showModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  showModal: () => void;
  payloadCallback: (payload: RemoveControllerPayload) => void;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const isMobile = useIsMobile();
  const [controllersToRemove, setControllersToRemove] = useState<
    ArweaveTransactionID[]
  >([]);
  const [state, setState] = useState<PDNTContractJSON>();
  const [tablePage, setTablePage] = useState<number>(1);
  const [rows, setRows] = useState<{ controller: ArweaveTransactionID }[]>([]);

  // TODO: add "transfer to another account" dropdown

  useEffect(() => {
    arweaveDataProvider
      .getContractState<PDNTContractJSON>(antId)
      .then((res) => {
        setState(res);
        const newRows = getControllerRows();
        setRows(newRows);
      });
  }, [antId]);

  useEffect(() => {
    const newRows = getControllerRows();
    setRows(newRows);
  }, [state]);

  if (!state) {
    return (
      <div className="modal-container">
        <Loader size={80} />
      </div>
    );
  }

  function handlePayloadCallback() {
    payloadCallback({
      target: controllersToRemove[0].toString(),
    });
  }

  function updatePage(page: number) {
    setTablePage(page);
  }

  function getControllerRows() {
    if (state?.controllers && Array.isArray(state.controllers)) {
      return state.controllers.map((controller) => ({
        controller: new ArweaveTransactionID(controller),
      }));
    } else if (state?.controller) {
      return [{ controller: new ArweaveTransactionID(state.controller) }];
    }
    return [];
  }

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<h2 className="white">Remove Controller</h2>}
        body={
          <div
            className="flex flex-column"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <div className="flex flex-column" style={{ gap: '10px' }}>
              <span className="grey">Contract ID</span>
              <span className="white">{antId.toString()}</span>
            </div>
            <div className="flex flex-row">
              <div
                className="flex flex-column"
                style={{ gap: '10px', width: 'fit-content' }}
              >
                <span className="grey">Nickname</span>
                <span className="white">
                  {formatForMaxCharCount(state.name, 20)}
                </span>
              </div>
              <div
                className="flex flex-column"
                style={{ gap: '10px', width: 'fit-content' }}
              >
                <span className="grey" style={{ whiteSpace: 'nowrap' }}>
                  Total Controllers
                </span>
                <span className="white">
                  {/* legacy contract state check */}
                  {getLegacyControllersFromState(state).length ?? 'N/A'}
                </span>
              </div>
              <div
                className="flex flex-column"
                style={{
                  gap: '10px',
                  height: '100%',
                  justifyContent: 'flex-start',
                  width: 'fit-content',
                }}
              >
                <span className="grey">Selected</span>
                <span
                  style={{
                    color:
                      controllersToRemove.length > 0
                        ? 'var(--error-red)'
                        : 'var(--text-white)',
                  }}
                >
                  {controllersToRemove.length}
                </span>
              </div>
            </div>
            <div className="flex flex-column" style={{ paddingBottom: '30px' }}>
              <div className="flex flex-column" style={{ gap: '10px' }}>
                {rows.length ? (
                  <>
                    <Table
                      prefixCls="remove-controller-table"
                      columns={[
                        {
                          title: '',
                          dataIndex: 'action',
                          key: 'action',
                          align: 'left',
                          width: '5%',
                          className: 'grey whitespace-no-wrap',
                          render: (value: string, row: any) => (
                            <Checkbox
                              prefixCls="remove-controller-checkbox"
                              // TODO: remove once we have support for multi remove of controllers
                              disabled={
                                controllersToRemove.length > 0 &&
                                !controllersToRemove.includes(row.controller)
                              }
                              checked={controllersToRemove
                                .map((c) => c.toString())
                                .includes(row.controller.toString())}
                              style={{ color: 'white' }}
                              onChange={() => {
                                if (
                                  controllersToRemove
                                    .map((c) => c.toString())
                                    .includes(row.controller.toString())
                                ) {
                                  const newControllers =
                                    controllersToRemove.filter(
                                      (controller) =>
                                        controller.toString() !==
                                        row.controller.toString(),
                                    );
                                  setControllersToRemove(newControllers);
                                } else {
                                  setControllersToRemove([
                                    ...controllersToRemove,
                                    row.controller,
                                  ]);
                                }
                              }}
                            />
                          ),
                        },
                        {
                          title: '',
                          dataIndex: 'controller',
                          key: 'controller',
                          align: 'left',
                          width: '00%',
                          className: 'grey whitespace-no-wrap',
                          render: (value: ArweaveTransactionID) => (
                            <span
                              className={
                                controllersToRemove.includes(value)
                                  ? 'white'
                                  : 'grey'
                              }
                            >
                              {value.toString()}
                            </span>
                          ),
                        },
                      ]}
                      dataSource={rows}
                      pagination={{
                        position: ['bottomLeft'],
                        rootClassName:
                          'table-pagination remove-controller-pagination',
                        itemRender: (page, type, originalElement) =>
                          getCustomPaginationButtons({
                            page,
                            type,
                            originalElement,
                            currentPage: tablePage,
                          }),
                        onChange: updatePage,
                        showPrevNextJumpers: true,
                        showSizeChanger: false,
                        current: tablePage,
                        pageSize: 8,
                      }}
                    />
                  </>
                ) : (
                  <div className="flex flex-column flex-center">
                    <span
                      className="flex flex-row warning-container center"
                      style={{ boxSizing: 'border-box' }}
                    >
                      {`This ANT token has no controllers to remove.`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        onCancel={() => showModal()}
        onClose={() => showModal()}
        onNext={
          controllersToRemove.length > 0
            ? () => handlePayloadCallback()
            : undefined
        }
        footer={
          <div className="flex">
            <TransactionCost
              fee={{}}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
              showBorder={false}
            />
          </div>
        }
        nextText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}

export default RemoveControllersModal;
