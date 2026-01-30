import { VerticalDotMenuIcon } from '@src/components/icons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import AddControllerModal from '@src/components/modals/ant-management/AddControllerModal/AddControllerModal';
import RemoveControllersModal from '@src/components/modals/ant-management/RemoveControllerModal/RemoveControllerModal';
import { Popover } from '@src/components/ui/Popover';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import {
  isArweaveTransactionID,
  isEthAddress,
  isValidAoAddress,
} from '@src/utils';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function ControllersRow({
  controllers = [],
  processId,
  confirm,
  editable = false,
}: {
  controllers: string[];
  processId: string;
  confirm: ({
    payload,
    workflowName,
  }: {
    payload: { controller: string };
    workflowName:
      | ANT_INTERACTION_TYPES.SET_CONTROLLER
      | ANT_INTERACTION_TYPES.REMOVE_CONTROLLER;
  }) => Promise<ContractInteraction>;
  editable?: boolean;
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
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

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
        label="Controllers"
        labelTooltip={`
          Controllers are the addresses that can manage the ANT and all associated names. They can add or remove controllers and update undernames.
        `}
        value={
          <div className="flex flex-row w-fit overflow-hidden mr-10">
            {controllers.map((c, index) => {
              if (isValidAoAddress(c)) {
                return (
                  <ArweaveID
                    key={index}
                    id={isEthAddress(c) ? c : new ArweaveTransactionID(c)}
                    shouldLink={isArweaveTransactionID(c)}
                    type={ArweaveIdTypes.ADDRESS}
                    characterCount={8}
                    wrapperStyle={{
                      width: 'fit-content',
                      whiteSpace: 'nowrap',
                    }}
                  />
                );
              } else return c;
            })}
          </div>
        }
        editable={editable}
        action={[
          editable ? (
            <Popover
              key={1}
              open={showTooltip}
              onOpenChange={setShowTooltip}
              side="bottom"
              align="end"
              content={
                <div className="flex-col flex" style={{ gap: '10px' }}>
                  <button
                    className="flex flex-right text-foreground pointer button"
                    onClick={() => {
                      setShowAddModal(true);
                      setShowTooltip(false);
                    }}
                  >
                    Add Controller
                  </button>
                  <button
                    className="flex flex-right text-foreground pointer button"
                    onClick={() => {
                      setShowRemoveModal(true);
                      setShowTooltip(false);
                    }}
                  >
                    Remove Controller
                  </button>
                </div>
              }
              contentClassName="p-3"
            >
              <button className="p-0 bg-transparent border-none cursor-pointer">
                <VerticalDotMenuIcon
                  width={'18px'}
                  height={'18px'}
                  fill="var(--text-grey)"
                  className="pointer"
                />
              </button>
            </Popover>
          ) : null,
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
          controllers={controllers}
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
