import { useSearchParams } from 'react-router-dom';

import { transactionDataKeys } from '../../types';

function useTransactionData() {
  const [searchParams] = useSearchParams();

  const URLTransactionData: { [x: string]: any } = {};
  transactionDataKeys.forEach((key: string) => {
    const res = searchParams.get(key);
    if (res) {
      URLTransactionData[key] = res;
    }
  });
  const URLContractType = searchParams.get('contractType');
  const URLInteractionType = searchParams.get('interactionType');

  // TODO: implement autofixes to type compatibility descrepencies ( if transaction data includes valid create ant keys for example, set the contract and interaction types appropriately)

  return { URLTransactionData, URLContractType, URLInteractionType };
}

export default useTransactionData;
