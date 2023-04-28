import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useTransactionData } from '../../../hooks';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import TransactionWorkflow, {
  TRANSACTION_WORKFLOW_STATUS,
} from '../../layout/TransactionWorkflow/TransactionWorkflow';

function Transaction() {
  const { transactionData, interactionType, workflowStage } =
    useTransactionData();
  const from = useLocation().state;
  const [, dispatchTransactionState] = useTransactionState();

  useEffect(() => {
    if (from) {
      dispatchTransactionState({
        type: 'setWorkflowStage',
        payload: TRANSACTION_WORKFLOW_STATUS.PENDING,
      });
    }
  }, [from]);

  if (!transactionData) {
    return <Navigate to={from ?? '/'} />;
  }
  return (
    <>
      <div className="page">
        <TransactionWorkflow
          interactionType={interactionType}
          transactionData={transactionData}
          workflowStage={workflowStage}
        />
      </div>
    </>
  );
}

export default Transaction;
