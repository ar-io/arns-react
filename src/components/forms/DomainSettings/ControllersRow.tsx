import { ANT } from '@ar.io/sdk';
import { VerticalDotMenuIcon } from '@src/components/icons';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import AddControllerModal from '@src/components/modals/ant-management/AddControllerModal/AddControllerModal';
import RemoveControllersModal from '@src/components/modals/ant-management/RemoveControllerModal/RemoveControllerModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function ControllersRow({
  processId,
  confirm,
}: {
  processId?: string;
  confirm: ({
    payload,
    workflowName,
  }: {
    payload: { controller: string };
    workflowName:
      | ANT_INTERACTION_TYPES.SET_CONTROLLER
      | ANT_INTERACTION_TYPES.REMOVE_CONTROLLER;
  }) => Promise<ContractInteraction>;
}) {
  const [payload, setPayload] = useState<{ controller: string }>({
    controller: '',
  });
  const [workflowName, setWorkflowName] = useState<
    | ANT_INTERACTION_TYPES.SET_CONTROLLER
    | ANT_INTERACTION_TYPES.REMOVE_CONTROLLER
  >(ANT_INTERACTION_TYPES.SET_CONTROLLER);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [controllers, setControllers] = useState<string[]>([]);

  useEffect(() => {
    if (processId) {
      ANT.init({ processId })
        .getControllers()
        .then((c) => {
          setControllers(c);
        });
    }
  }, [processId]);

  async function handleControllerInteraction({
    payload,
    workflowName,
  }: {
    payload: { controller: string };
    workflowName:
      | ANT_INTERACTION_TYPES.REMOVE_CONTROLLER
      | ANT_INTERACTION_TYPES.SET_CONTROLLER;
  }) {
    try {
      await confirm({
        payload,
        workflowName,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setShowAddModal(false);
      setShowRemoveModal(false);
      setShowConfirmModal(false);
    }
  }
  return (
    <>
      <DomainSettingsRow
        label="Controllers(s):"
        value={controllers}
        action={[
          <Tooltip
            key={1}
            open={undefined}
            placement="bottomRight"
            color="var(--card-bg)"
            autoAdjustOverflow
            arrow={false}
            overlayInnerStyle={{
              width: 'fit-content',
              border: '1px solid var(--text-faded)',
              padding: '9px 12px',
            }}
            overlayStyle={{ width: 'fit-content' }}
            trigger={'click'}
            title={
              <div className="flex-column flex" style={{ gap: '10px' }}>
                <button
                  className="flex flex-right white pointer button"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Controller
                </button>
                <button
                  className="flex flex-right white pointer button"
                  onClick={() => setShowRemoveModal(true)}
                >
                  Remove Controller
                </button>
              </div>
            }
          >
            <VerticalDotMenuIcon
              width={'18px'}
              height={'18px'}
              fill="var(--text-grey)"
              className="pointer"
            />
          </Tooltip>,
        ]}
      />
      {showAddModal && processId && (
        <AddControllerModal
          closeModal={() => setShowAddModal(false)}
          antId={new ArweaveTransactionID(processId)}
          payloadCallback={(c) => {
            setWorkflowName(ANT_INTERACTION_TYPES.SET_CONTROLLER);
            setPayload(c);
            setShowConfirmModal(true);
            setShowAddModal(false);
          }}
        />
      )}
      {showRemoveModal && processId && (
        <RemoveControllersModal
          closeModal={() => setShowRemoveModal(false)}
          antId={new ArweaveTransactionID(processId)}
          payloadCallback={(c) => {
            setWorkflowName(ANT_INTERACTION_TYPES.REMOVE_CONTROLLER);
            setPayload(c);
            setShowConfirmModal(true);
            setShowRemoveModal(false);
          }}
        />
      )}
      {showConfirmModal && (
        <ConfirmTransactionModal
          cancel={() => setShowConfirmModal(false)}
          confirm={() => handleControllerInteraction({ payload, workflowName })}
          interactionType={workflowName}
          content={
            workflowName === ANT_INTERACTION_TYPES.SET_CONTROLLER ? (
              <>
                <span>
                  By completing this action, you are going to add{' '}
                  <span className="text-color-warning">{`"${payload.controller}"`}</span>{' '}
                  as a controller.
                </span>
                <span>Are you sure you want to continue?</span>
              </>
            ) : (
              <>
                <span>
                  By completing this action, you are going to remove{' '}
                  <span className="text-color-error">{`"${payload.controller}"`}</span>{' '}
                  as a controller.
                </span>
                <span>Are you sure you want to continue?</span>
              </>
            )
          }
        />
      )}
    </>
  );
}