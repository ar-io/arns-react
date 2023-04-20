import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ANT_INTERACTION_TYPES,
  AntInteraction,
  CONTRACT_TYPES,
  ContractType,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
} from '../../types';
import { getTransactionPayloadByInteractionType } from '../../utils/searchUtils';

function useTransactionData() {
  const [searchParams] = useSearchParams();
  const [URLTransactionData, setURLTransactionData] = useState<{
    [x: string]: any;
  }>({});
  const [URLAssetId, setURLAssetId] = useState<string>(
    () => searchParams.get('assetId') ?? '',
  );
  const [URLContractType, setURLContractType] = useState<ContractType>(() => {
    const contractType = searchParams.get('contractType') ?? '';
    const upperCaseContractType = contractType.toUpperCase();
    if (Object.keys(CONTRACT_TYPES).includes(upperCaseContractType)) {
      const k = upperCaseContractType as keyof typeof CONTRACT_TYPES;
      return CONTRACT_TYPES[k];
    } else {
      return CONTRACT_TYPES.UNKNOWN;
    }
  });
  const [URLInteractionType, setURLInteractionType] = useState<
    AntInteraction | RegistryInteraction
  >(() => {
    const interactionType = searchParams.get('interactionType') ?? '';
    const upperCaseInteractionType = interactionType.toUpperCase();
    if (Object.keys(ANT_INTERACTION_TYPES).includes(upperCaseInteractionType)) {
      const k = upperCaseInteractionType as keyof typeof ANT_INTERACTION_TYPES;
      return ANT_INTERACTION_TYPES[k];
    } else if (
      Object.keys(REGISTRY_INTERACTION_TYPES).includes(upperCaseInteractionType)
    ) {
      const k =
        upperCaseInteractionType as keyof typeof REGISTRY_INTERACTION_TYPES;
      return REGISTRY_INTERACTION_TYPES[k];
    } else {
      return ANT_INTERACTION_TYPES.UNKNOWN;
    }
  });

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
