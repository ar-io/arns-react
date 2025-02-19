import { useANT } from '@src/hooks/useANT/useANT';
import { AoAddress } from '@src/types';
import { Checkbox, Table } from 'antd';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import {
  formatForMaxCharCount,
  getCustomPaginationButtons,
  isEthAddress,
} from '../../../../utils';
import DialogModal from '../../DialogModal/DialogModal';
import './styles.css';

function RemoveControllersModal({
  antId,
  controllers = [],
  closeModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID;
  controllers: string[];
  closeModal: () => void;
  payloadCallback: (payload: { controller: string }) => void;
}) {
  const isMobile = useIsMobile();
  const [controllersToRemove, setControllersToRemove] = useState<AoAddress[]>(
    [],
  );
  const [tablePage, setTablePage] = useState<number>(1);
  const { name = 'N/A' } = useANT(antId.toString());
  const [rows, setRows] = useState<{ controller: AoAddress }[]>(
    controllers.map((controller) => ({
      controller: isEthAddress(controller)
        ? controller
        : new ArweaveTransactionID(controller),
    })),
  );

  useEffect(() => {
    setRows(
      controllers.map((controller) => ({
        controller: isEthAddress(controller)
          ? controller
          : new ArweaveTransactionID(controller),
      })),
    );
  }, [controllers]);

  function handlePayloadCallback() {
    payloadCallback({
      controller: controllersToRemove[0].toString(),
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
        title={<h2 className="white text-xl">Remove Controller</h2>}
        body={
          <div
            className="flex flex-column"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <div className="flex flex-col gap-2">
              <span className="grey">Process ID</span>
              <span className="white">{antId.toString()}</span>
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col gap-2">
                <span className="grey">Nickname</span>
                <span className="white">{formatForMaxCharCount(name, 20)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="grey" style={{ whiteSpace: 'nowrap' }}>
                  Total Controllers
                </span>
                <span className="white">{rows.length ?? 'N/A'}</span>
              </div>
              <div
                className="flex flex-col gap-2"
                style={{
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
                          // eslint-disable-next-line
                          render: (value: string, row: any) => (
                            <Checkbox
                              key={row.controller}
                              prefixCls="remove-controller-checkbox"
                              // TODO: remove once we have support for multi remove of controllers
                              checked={controllersToRemove
                                .map((c) => c.toString())
                                .includes(row.controller.toString())}
                              style={{ color: 'white' }}
                              onChange={() => {
                                if (
                                  controllersToRemove.includes(row.controller)
                                ) {
                                  setControllersToRemove([]);
                                  return;
                                }
                                setControllersToRemove([row.controller]);
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
                          render: (value: AoAddress) => (
                            <span
                              className={
                                controllersToRemove.includes(value)
                                  ? 'white'
                                  : 'grey'
                              }
                            >
                              {value?.toString()}
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
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          controllersToRemove.length > 0
            ? () => handlePayloadCallback()
            : undefined
        }
        footer={
          <div className="flex">
            {/* <TransactionCost
              fee={{}}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
              showBorder={false}
            /> */}
          </div>
        }
        nextText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}

export default RemoveControllersModal;
