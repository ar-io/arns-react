import { VerticalDotMenuIcon } from '@src/components/icons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import AddControllerModal from '@src/components/modals/ant-management/AddControllerModal/AddControllerModal';
import RemoveControllersModal from '@src/components/modals/ant-management/RemoveControllerModal/RemoveControllerModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SolanaAddress } from '@src/services/solana/SolanaAddress';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import {
  isArweaveTransactionID,
  isEthAddress,
  isValidAoAddress,
} from '@src/utils';
import { Tooltip } from 'antd';
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
              if (!isValidAoAddress(c)) return c;
              const id = isEthAddress(c)
                ? c
                : isArweaveTransactionID(c)
                  ? new ArweaveTransactionID(c)
                  : new SolanaAddress(c);
              return (
                <ArweaveID
                  key={index}
                  id={id}
                  shouldLink={!isEthAddress(c)}
                  type={ArweaveIdTypes.ADDRESS}
                  characterCount={8}
                  wrapperStyle={{
                    width: 'fit-content',
                    whiteSpace: 'nowrap',
                  }}
                />
              );
            })}
          </div>
        }
        editable={editable}
        action={[
          editable ? (
            <Tooltip
              key={1}
              open={showTooltip}
              onOpenChange={setShowTooltip}
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
                <div className="flex-col flex" style={{ gap: '10px' }}>
                  <button
                    data-testid="controllers-add-menu-button"
                    className="flex flex-right white pointer button"
                    onClick={() => {
                      setShowAddModal(true);
                      setShowTooltip(false);
                    }}
                  >
                    Add Controller
                  </button>
                  <button
                    data-testid="controllers-remove-menu-button"
                    className="flex flex-right white pointer button"
                    onClick={() => {
                      setShowRemoveModal(true);
                      setShowTooltip(false);
                    }}
                  >
                    Remove Controller
                  </button>
                </div>
              }
            >
              <span
                data-testid="controllers-row-menu-trigger"
                className="inline-flex"
              >
                <VerticalDotMenuIcon
                  width={'18px'}
                  height={'18px'}
                  fill="var(--text-grey)"
                  className="pointer"
                />
              </span>
            </Tooltip>
          ) : null,
        ]}
      />
      {showAddModal && processId && (
        <AddControllerModal
          closeModal={() => setShowAddModal(false)}
          antId={new SolanaAddress(processId)}
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
          antId={new SolanaAddress(processId)}
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
