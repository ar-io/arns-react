import { useSearchParams } from 'react-router-dom';

import type { Transaction } from '../services/db/transaction_db';

export function useTransactionParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setTransaction = (transaction: Transaction) => {
    const encoded = btoa(JSON.stringify(transaction));
    setSearchParams({ tx: encoded });
  };

  const getTransaction = (): Transaction | null => {
    const encoded = searchParams.get('tx');
    if (!encoded) return null;

    try {
      const decoded = atob(encoded);
      return JSON.parse(decoded) as Transaction;
    } catch (e) {
      console.error('Failed to parse transaction from URL:', e);
      return null;
    }
  };

  return {
    setTransaction,
    getTransaction,
  };
}
