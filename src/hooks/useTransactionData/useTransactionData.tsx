import { useEffect } from 'react';
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { useTransactionState } from '../../state/contexts/TransactionState';

export function useTransactionData() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const from = useLocation().state;

  const [{ transactionData, interactionType, workflowStage }] =
    useTransactionState();

  /**
   * TODO: parse search params that are provided on initial page load and update the
   * transaction state with those values. That will allow users to dynamically link
   * transaction interactions.
   */

  useEffect(() => {
    if (!transactionData) {
      navigate(from ?? '/');
      return;
    }

    const updatedSearchParams = createSearchParams({
      // TODO: sanitize these values
      ...(transactionData as any),
      interactionType,
      workflowStage,
    });

    setSearchParams(updatedSearchParams, { replace: true });
  }, [transactionData, interactionType, workflowStage]);

  return {
    transactionData,
    interactionType,
    workflowStage,
  };
}

export default useTransactionData;
