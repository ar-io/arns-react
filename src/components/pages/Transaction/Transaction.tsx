import { useEffect } from 'react';

import { useTransactionData } from '../../../hooks';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  AntInteraction,
  ContractType,
  RegistryInteraction,
} from '../../../types';
import { Loader } from '../../layout';
import TransactionWorkflow from '../../layout/TransactionWorkflow/TransactionWorkflow';

function Transaction() {
  const [
    { contractType, interactionType, transactionData, workflowStage },
    dispatchTransactionState,
  ] = useTransactionState();
  const { URLContractType, URLInteractionType, URLTransactionData } =
    useTransactionData();

  useEffect(() => {
    if (URLTransactionData !== transactionData) {
      dispatchTransactionState({
        type: 'setTransactionData',
        payload: URLTransactionData,
      });
    }
    if (URLContractType !== contractType) {
      dispatchTransactionState({
        type: 'setContractType',
        payload: URLContractType as ContractType,
      });
    }
    if (URLInteractionType !== interactionType) {
      dispatchTransactionState({
        type: 'setInteractionType',
        payload: URLInteractionType as AntInteraction | RegistryInteraction,
      });
    }
  }, []);

  if (!transactionData.contractTxId) {
    return (
      <div
        className="page flex-column flex-center"
        style={{ height: '100%', width: '100%', boxSizing: 'border-box' }}
      >
        <div className="flex flex-row text-large white bold center">
          Loading Transaction Details
        </div>
        <Loader size={200} />
      </div>
    );
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
