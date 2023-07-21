import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useTransactionData } from '../../../hooks';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import { Loader } from '../../layout';
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

  if (!transactionData && !interactionType) {
    return <Navigate to={from ?? '/'} />;
  }
  if (!transactionData) {
    return <Loader size={80} />;
  }
  return (
    <div
      className="page flex flex-column center"
      style={{ width: '100%', maxWidth: 776, margin: 'auto' }}
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
