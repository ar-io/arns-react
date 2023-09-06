import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useIsMobile, useTransactionData } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import { INTERACTION_TYPES, IncreaseUndernamesPayload } from '../../../types';
import {
  TRANSACTION_DATA_KEYS,
  isObjectOfTransactionPayloadType,
} from '../../../utils';
import { Loader } from '../../layout';
import TransactionWorkflow, {
  TRANSACTION_WORKFLOW_STATUS,
} from '../../layout/TransactionWorkflow/TransactionWorkflow';

function Transaction() {
  const [, dispatchGlobalState] = useGlobalState();
  const { transactionData, interactionType, workflowStage } =
    useTransactionData();
  const from = useLocation().state;
  const [, dispatchTransactionState] = useTransactionState();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (from) {
      dispatchTransactionState({
        type: 'setWorkflowStage',
        payload: TRANSACTION_WORKFLOW_STATUS.PENDING,
      });
    }

    if (
      transactionData &&
      isObjectOfTransactionPayloadType<IncreaseUndernamesPayload>(
        transactionData,
        TRANSACTION_DATA_KEYS[INTERACTION_TYPES.INCREASE_UNDERNAMES].keys,
      )
    ) {
      dispatchGlobalState({
        type: 'setNavItems',
        payload: [
          {
            name: 'Manage Assets',
            route: '/manage/names',
          },
          {
            name: `${transactionData.name}`,
            route: `/manage/names/${transactionData.name}`,
          },
          {
            name: 'Increase Undernames',
            route: `/manage/names/${transactionData.name}/undernames`,
          },
          {
            name: 'Review',
            route: location.pathname,
          },
        ],
      });
    }
  }, [from, transactionData]);

  if (!transactionData && !interactionType) {
    return <Navigate to={from ?? '/'} />;
  }
  if (!transactionData) {
    return <Loader size={80} />;
  }
  return (
    <div
      id="transaction-page"
      className="page flex flex-column center"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: isMobile ? '30px 10px' : '50px 30%',
      }}
    >
      <TransactionWorkflow
        interactionType={interactionType}
        transactionData={transactionData}
        workflowStage={workflowStage}
      />
    </div>
  );
}

export default Transaction;
