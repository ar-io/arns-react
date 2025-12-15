import { useMemo } from 'react';

import {
  BASE_NAME_FEES,
  LEASE_MULTIPLIER,
  MAX_ARNS_NAME_LENGTH,
  PERMABUY_MULTIPLIER,
} from '@src/utils/constants';

import { useArIoPrice } from './useArIOPrice';
import { useDemandFactor } from './useDemandFactor';

export interface NameAffordability {
  /** Minimum character length affordable for a 1-year lease, or null if none affordable */
  minLeaseChars: number | null;
  /** Minimum character length affordable for a permanent purchase, or null if none affordable */
  minPermabuyChars: number | null;
  /** Whether the user can afford any name at all */
  canAffordAnyName: boolean;
  /** Whether the data is still loading */
  isLoading: boolean;
}

/**
 * Hook to determine what ArNS names a user can afford based on USD amount.
 *
 * @param usdAmount - The USD value of what the user is purchasing
 * @returns NameAffordability object with minimum character lengths for lease and permabuy
 */
export function useNameAffordability(
  usdAmount: number | undefined,
): NameAffordability {
  const { data: demandFactor, isLoading: isLoadingDemand } = useDemandFactor();
  const { data: arIoPrice, isLoading: isLoadingArIo } = useArIoPrice();

  const isLoading = isLoadingDemand || isLoadingArIo;

  return useMemo(() => {
    // Default state when loading or no data
    if (
      isLoading ||
      !demandFactor ||
      !arIoPrice ||
      !usdAmount ||
      usdAmount <= 0
    ) {
      return {
        minLeaseChars: null,
        minPermabuyChars: null,
        canAffordAnyName: false,
        isLoading,
      };
    }

    let minLeaseChars: number | null = null;
    let minPermabuyChars: number | null = null;

    // Iterate through character lengths from longest (cheapest) to shortest (most expensive)
    // to find the minimum character length the user can afford
    for (let chars = MAX_ARNS_NAME_LENGTH; chars >= 1; chars--) {
      const baseFee = BASE_NAME_FEES[chars];
      if (!baseFee) continue;

      // Calculate name costs in USD
      // Cost in ARIO = baseFee * demandFactor * multiplier
      // Cost in USD = ARIO cost * ARIO price
      const leaseCostUsd =
        baseFee * demandFactor * LEASE_MULTIPLIER * arIoPrice;
      const permabuyCostUsd =
        baseFee * demandFactor * PERMABUY_MULTIPLIER * arIoPrice;

      // Check if user can afford this character length
      if (usdAmount >= leaseCostUsd) {
        minLeaseChars = chars;
      }
      if (usdAmount >= permabuyCostUsd) {
        minPermabuyChars = chars;
      }
    }

    return {
      minLeaseChars,
      minPermabuyChars,
      canAffordAnyName: minLeaseChars !== null || minPermabuyChars !== null,
      isLoading: false,
    };
  }, [usdAmount, demandFactor, arIoPrice, isLoading]);
}

/**
 * Format the name affordability as a display string.
 * Always shows both permabuy and lease options when both are affordable.
 *
 * @param affordability - The NameAffordability object
 * @returns A formatted string like "51+ chars (perm) or 13+ chars (1yr)" or null if nothing affordable
 */
export function formatNameAffordability(
  affordability: NameAffordability,
): string | null {
  const { minLeaseChars, minPermabuyChars, canAffordAnyName, isLoading } =
    affordability;

  if (isLoading || !canAffordAnyName) {
    return null;
  }

  // Both permabuy and lease affordable - always show both
  if (minPermabuyChars !== null && minLeaseChars !== null) {
    return `${minLeaseChars}+ char (1yr) or ${minPermabuyChars}+ char (perm)`;
  }

  // Only lease affordable
  if (minLeaseChars !== null) {
    return `${minLeaseChars}+ char names (1yr)`;
  }

  // Only permabuy affordable (unlikely but handle it)
  if (minPermabuyChars !== null) {
    return `${minPermabuyChars}+ char names (perm)`;
  }

  return null;
}
