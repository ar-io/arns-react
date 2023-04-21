import { Navigate, useLocation } from 'react-router-dom';

import { useTransactionData } from '../../../hooks';
import TransactionWorkflow from '../../layout/TransactionWorkflow/TransactionWorkflow';

function Transaction() {
  const { transactionData, contractType, interactionType, workflowStage } =
    useTransactionData();
  const from = useLocation().state;

  if (!transactionData) {
    return <Navigate to={from ?? '/'} />;
  }

  return (
    <>
      <div className="page">
        <TransactionWorkflow
          contractType={contractType}
          interactionType={interactionType}
          transactionData={transactionData}
          workflowStage={workflowStage}
        />
      </div>
    </>
  );
}

export default Transaction;
