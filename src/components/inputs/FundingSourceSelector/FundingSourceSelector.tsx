import { CostDetailsResult, FundFrom, mARIOToken } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { CircleXFilled } from '@src/components/icons';
import { useCostDetails } from '@src/hooks/useCostDetails';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIO } from '@src/utils';
import { InsufficientFundsError } from '@src/utils/errors';
import { CircleCheck, Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SelectDropdown } from '../Select';

type CostDetailsParams = Parameters<typeof useCostDetails>[0];

const fundingSources = ['balance', 'stakes', 'any'] as const;

function getStakeUsed(costDetails?: CostDetailsResult) {
  return costDetails?.fundingPlan
    ? Object.values(costDetails.fundingPlan.stakes).reduce((acc, stake) => {
        acc = acc + stake.delegatedStake;
        acc =
          acc +
          Object.values(stake.vaults as any as Record<string, number>).reduce(
            (acc, vault) => acc + vault,
            0,
          );
        return acc;
      }, 0)
    : 0;
}
export function FundingSourceSelector({
  details,
  costDetailsCallback,
  onChange,
}: {
  details: CostDetailsParams;
  costDetailsCallback?: (deets?: CostDetailsResult) => void;
  onChange?: (t: (typeof fundingSources)[number]) => void;
}) {
  const [{ arioTicker }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  const {
    data: balanceCostDetails,
    error: balanceCostDetailsError,
    isLoading: loadingBalanceCostDetails,
  } = useCostDetails({
    ...details,
    fromAddress: details.fromAddress || walletAddress?.toString(),
    fundFrom: 'balance',
  });
  const {
    data: stakeCostDetails,
    error: stakeCostDetailsError,
    isLoading: loadingStakeCostDetails,
  } = useCostDetails({
    ...details,
    fromAddress: details.fromAddress || walletAddress?.toString(),
    fundFrom: 'stakes',
  });
  const {
    data: anyCostDetails,
    error: anyCostDetailsError,
    isLoading: loadingAnyCostDetails,
  } = useCostDetails({
    ...details,
    fromAddress: details.fromAddress || walletAddress?.toString(),
    fundFrom: 'any',
  });

  const [fundFrom, setFundFrom] = useState<FundFrom>(
    details.fundFrom || 'balance',
  );

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const [totalBalanceUsed, setTotalBalanceUsed] = useState(0);
  const [totalStakeUsed, setTotalStakeUsed] = useState(0);

  useEffect(() => {
    let costDetails = undefined;

    switch (fundFrom) {
      case 'any':
        costDetails = anyCostDetails;
        setError(anyCostDetailsError);
        setLoading(loadingAnyCostDetails);
        break;
      case 'balance':
        costDetails = balanceCostDetails;
        setError(balanceCostDetailsError);
        setLoading(loadingBalanceCostDetails);
        break;
      case 'stakes':
        costDetails = stakeCostDetails;
        setError(stakeCostDetailsError);
        setLoading(loadingAnyCostDetails);
        break;
    }

    if (costDetails) {
      costDetailsCallback?.(costDetails);
      if (costDetails.fundingPlan?.shortfall) {
        setError(
          new InsufficientFundsError(
            `You lack sufficient ${arioTicker} to pay for this transaction - you need ${formatARIO(
              new mARIOToken(costDetails.fundingPlan.shortfall)
                .toARIO()
                .valueOf(),
            )} more ${arioTicker} to complete this transaction`,
          ),
        );
      }
    }

    setTotalBalanceUsed(costDetails?.fundingPlan?.balance ?? 0);

    setTotalStakeUsed(getStakeUsed(costDetails));
  }, [
    fundFrom,
    anyCostDetails,
    balanceCostDetails,
    stakeCostDetails,
    anyCostDetailsError,
    balanceCostDetailsError,
    stakeCostDetailsError,
    loadingAnyCostDetails,
    loadingStakeCostDetails,
    loadingBalanceCostDetails,
  ]);

  return (
    <SelectDropdown
      position="item-aligned"
      className={{
        trigger:
          'bg-foreground text-white flex gap-2 items-center p-3 rounded-lg border border-[#A7A7A759] outline-none justify-between h-fit w-fit text-sm',
        item: 'w-[24rem] flex items-center gap-3 cursor-pointer bg-foreground hover:bg-dark-grey px-3 py-3 text-grey fill-grey hover:fill-white  hover:text-white outline-none  transition-all',
        content:
          'flex bg-foreground z-[100] rounded overflow-hidden border py-2 w-[24rem] border-[#A7A7A759] absolute left-[-2.5rem]',
        group: 'flex flex-col  bg-foreground text-sm',
        viewport: 'flex pr-1 justify-start',
      }}
      options={[
        {
          label: loadingBalanceCostDetails ? (
            'Loading...'
          ) : (
            <span>
              Liquid Balance (
              {formatARIO(
                new mARIOToken(balanceCostDetails?.fundingPlan?.balance ?? 0)
                  .toARIO()
                  .valueOf(),
              )}{' '}
              {arioTicker})
            </span>
          ),
          value: 'balance',
        },
        {
          label: loadingStakeCostDetails ? (
            'Loading...'
          ) : (
            <span>
              Withdrawing/Staked Balance (
              {formatARIO(
                new mARIOToken(getStakeUsed(stakeCostDetails))
                  .toARIO()
                  .valueOf(),
              )}{' '}
              {arioTicker})
            </span>
          ),
          value: 'stakes',
        },
        {
          label: loadingAnyCostDetails ? (
            'Loading...'
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="flex w-fit">
                Liquid + Withdrawing/Staked Balances
              </span>
              <span className="flex w-fit">
                (
                {formatARIO(
                  new mARIOToken(anyCostDetails?.fundingPlan?.balance ?? 0)
                    .toARIO()
                    .valueOf(),
                )}
                &nbsp;+&nbsp;{' '}
                {formatARIO(
                  new mARIOToken(getStakeUsed(anyCostDetails))
                    .toARIO()
                    .valueOf(),
                )}{' '}
                {arioTicker})
              </span>
            </div>
          ),
          value: 'any',
        },
      ]}
      onChange={(e) => {
        setFundFrom(e as any);
        onChange?.(e as any);
      }}
      value={fundFrom}
      renderValue={(v) => (
        <Tooltip
          tooltipOverrides={{
            overlayInnerStyle: {
              width: 'fit-content',
              padding: '10px',
            },
          }}
          message={
            <div className="flex flex-col gap-2">
              <h2 className="text-[18px]">
                {error ? error.name : 'Funding Plan'}
              </h2>
              {error ? (
                <p>{error.message}</p>
              ) : (
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-white whitespace-nowrap">
                    <span className="text-grey">Liquid Balance to spend:</span>{' '}
                    {formatARIO(
                      new mARIOToken(totalBalanceUsed).toARIO().valueOf(),
                    )}{' '}
                    {arioTicker}
                  </span>

                  <span className="text-white whitespace-nowrap">
                    <span className="text-grey">Delegated Stake to spend:</span>{' '}
                    {formatARIO(
                      new mARIOToken(totalStakeUsed).toARIO().valueOf(),
                    )}{' '}
                    {arioTicker}
                  </span>
                </div>
              )}
            </div>
          }
          icon={
            <span className="text-white fill-white flex gap-3 items-center cursor-pointer w-full">
              {loading ? (
                <Loader2Icon className="text-white animate-spin" />
              ) : !error ? (
                <CircleCheck
                  width={'20px'}
                  height={'20px'}
                  className="text-black fill-white"
                />
              ) : (
                <CircleXFilled
                  width={'18px'}
                  height={'18px'}
                  className="text-black fill-error"
                />
              )}
              {v}
            </span>
          }
        />
      )}
    />
  );
}
