import { Checkbox, Pagination, Table } from 'antd';
import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  RemoveControllersPayload,
} from '../../../types';
import {
  formatForMaxCharCount,
  getCustomPaginationButtons,
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
  payloadCallback: (payload: RemoveControllersPayload) => void;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const isMobile = useIsMobile();
  const [controllersToRemove, setControllersToRemove] = useState<
    ArweaveTransactionID[]
  >([]);
  const [state, setState] = useState<PDNTContractJSON>();
  const [tablePage, setTablePage] = useState<number>(1);

  // TODO: add "transfer to another account" dropdown

  useEffect(() => {
    arweaveDataProvider
      .getContractState(antId)
      .then((res) => setState(res as PDNTContractJSON));
  }, [antId]);

  if (!state) {
    return (
      <div className="modal-container">
        <Loader size={80} />
      </div>
    );
  }

  function handlePayloadCallback() {
    payloadCallback({
      targets: controllersToRemove.map((controller) => controller.toString()),
    });
  }

  function updatePage(page: number) {
    setTablePage(page);
  }

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<h2 className="white">Remove Controllers</h2>}
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
              <div className="flex flex-column" style={{ gap: '10px' }}>
                <span className="grey">Nickname</span>
                <span className="white">
                  {formatForMaxCharCount(state.name, 40)}
                </span>
              </div>
              <div className="flex flex-column" style={{ gap: '10px' }}>
                <span className="grey">Total Controllers</span>
                <span className="white">
                  {/* legacy contract state check */}
                  {state.controller
                    ? 1
                    : state.controllers && Array.isArray(state.controllers)
                    ? state.controllers.length.toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex flex-column" style={{ gap: '10px' }}>
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
                {state && (state.controller || state.controllers?.length) ? (
                  <>
                    <Table
                      prefixCls="remove-controller-table"
                      pagination={false}
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
                              checked={controllersToRemove.includes(
                                row.controller,
                              )}
                              style={{ color: 'white' }}
                              onChange={() => {
                                if (
                                  controllersToRemove.includes(row.controller)
                                ) {
                                  const newControllers =
                                    controllersToRemove.filter(
                                      (controller) =>
                                        controller !== row.controller,
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
                      dataSource={
                        state.controller
                          ? [{ controller: state.controller }]
                          : state.controllers &&
                            Array.isArray(state.controllers)
                          ? state.controllers.map((controller) => ({
                              controller,
                            }))
                          : []
                      }
                    />
                    <div
                      className="flex flex-row"
                      style={{
                        alignItems: 'flex-start',
                        background: 'var(--bg-color)',
                        borderRadius: 'var(--corner-radius)',
                        padding: '10px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Pagination
                        pageSize={8}
                        total={
                          state.controller
                            ? 1
                            : state.controllers &&
                              Array.isArray(state.controllers)
                            ? state.controllers.length
                            : 1
                        }
                        rootClassName={
                          'table-pagination remove-controller-pagination'
                        }
                        itemRender={(page, type, originalElement) =>
                          getCustomPaginationButtons({
                            page,
                            type,
                            originalElement,
                            currentPage: tablePage,
                            nextStyle: {
                              display: 'none',
                              height: '0px',
                              minHeight: '0px',
                            },
                            prevStyle: { display: 'none' },
                          })
                        }
                        onChange={updatePage}
                        showPrevNextJumpers={true}
                        showSizeChanger={false}
                        current={tablePage}
                      />
                    </div>
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
        nextText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
}

export default RemoveControllersModal;
