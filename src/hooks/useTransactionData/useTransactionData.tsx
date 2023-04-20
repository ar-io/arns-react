import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  AntInteractionTypeName,
  CONTRACT_TYPES,
  INTERACTION_TYPES,
  InteractionTypeName,
  RegistryInteractionTypeName,
} from '../../types';
import {
  getSearchParam,
  getTransactionPayloadByInteractionType,
  isAntInteraction,
  isRegistryInteraction,
} from '../../utils/searchUtils';

function useTransactionData() {
  const [searchParams] = useSearchParams();
  const [URLTransactionData, setURLTransactionData] = useState<{
    [x: string]: any;
  }>({});
  const [URLAssetId, setURLAssetId] = useState<string>(
    () => searchParams.get('assetId') ?? '',
  );
  const [URLContractType, setURLContractType] = useState<CONTRACT_TYPES>(() => {
    return getSearchParam<CONTRACT_TYPES>(searchParams, 'contractType');
  });
  const [URLInteractionType, setURLInteractionType] =
    useState<InteractionTypeName>(() => {
      const interactionType = getSearchParam<INTERACTION_TYPES>(
        searchParams,
        'interactionType',
      );

      if (isAntInteraction(interactionType)) {
        return interactionType as AntInteractionTypeName;
      } else if (isRegistryInteraction(interactionType)) {
        return interactionType as RegistryInteractionTypeName;
      } else {
        return INTERACTION_TYPES.UNKNOWN;
      }
    });

  useEffect(() => {
    const newURLAssetId = searchParams.get('assetId');
    const newURLContractType = getSearchParam<CONTRACT_TYPES>(
      searchParams,
      'contractType',
    );
    const newURLInteractionType = getSearchParam<InteractionTypeName>(
      searchParams,
      'interactionType',
    );
    const newURLTransactionData = searchParams.getAll('data');
    setURLAssetId(newURLAssetId!);
    setURLContractType(newURLContractType);
    setURLInteractionType(newURLInteractionType);

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
