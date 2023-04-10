import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { STUB_ARWEAVE_TXID } from '../../../utils/constants';
import TransactionWorkflow from '../../layout/TransactionWorkflow/TransactionWorkflow';

const DEFAULT_WORKFLOW_CONFIG = {
  contractType: 'ANT',
  interactionType: 'TRANSFER',
  transactionData: { target: undefined },
};

function Transaction() {
  const [{}, dispatchGlobalState] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { walletAddress } = useWalletAddress();
  const [workflowConfig, setWorkflowConfig] = useState<{
    contractType: string;
    interactionType: string;
    transactionData: any;
  }>(DEFAULT_WORKFLOW_CONFIG);

  // TODO: parse url params to configure component

  useEffect(() => {
    setConfig();
  }, [window.location]);

  function setConfig() {
    try {
      const contractType = searchParams.get('contractType');
      const interactionType = searchParams.get('interactionType');
      const transactionData = searchParams.get('transactionData');

      if (!contractType || !interactionType || !transactionData) {
        throw new Error(
          'unable to set transaction config, undefined config data',
        );
      }

      setWorkflowConfig({ contractType, interactionType, transactionData });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className="page">
        <span className="section-header">transaction</span>
        <TransactionWorkflow
          contractType={workflowConfig.contractType}
          interactionType={workflowConfig.interactionType}
          transactionData={workflowConfig.transactionData}
        />
      </div>
      {/* TODO: render transaction workflow component based on parse url params */}
    </>
  );
}

export default Transaction;
