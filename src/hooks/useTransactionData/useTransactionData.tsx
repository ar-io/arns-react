import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AntInteraction, ContractType, RegistryInteraction } from '../../types';
import { getTransactionPayloadByInteractionType } from '../../utils/searchUtils';

function useTransactionData() {
  const [searchParams] = useSearchParams();
  const [URLTransactionData, setURLTransactionData] = useState<{
    [x: string]: any;
  }>({});
  const [URLAssetId, setURLAssetId] = useState<string>(
    () => searchParams.get('assetId') ?? '',
  );
  const [URLContractType, setURLContractType] = useState<ContractType>(
    () =>
      (searchParams.get('contractType') as ContractType) ??
      ('' as ContractType),
  );
  const [URLInteractionType, setURLInteractionType] = useState<
    AntInteraction | RegistryInteraction
  >(
    (searchParams.get('interactionType') as
      | AntInteraction
      | RegistryInteraction) ?? ('' as AntInteraction | RegistryInteraction),
  );

  useEffect(() => {
    const newURLAssetId = searchParams.get('assetId');
    const newURLContractType = searchParams.get('contractType');
    const newURLInteractionType = searchParams.get('interactionType');
    const newURLTransactionData = searchParams.getAll('data');
    setURLAssetId(newURLAssetId!);
    setURLContractType(newURLContractType as ContractType);
    setURLInteractionType(
      newURLInteractionType as AntInteraction | RegistryInteraction,
    );

    if (newURLTransactionData) {
      const payload = getTransactionPayloadByInteractionType(
        URLContractType,
        URLInteractionType,
        newURLTransactionData,
      );
      if (payload) {
        setURLTransactionData({ ...payload, assetId: URLAssetId });
      }
    }
  }, [searchParams]);
  // TODO: implement autofixes to type compatibility descrepencies ( if transaction data includes valid create ant keys for example, set the contract and interaction types appropriately)

  return { URLTransactionData, URLContractType, URLInteractionType };
}

export default useTransactionData;
