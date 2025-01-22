import { AoGetCostDetailsParams, mARIOToken } from '@ar.io/sdk';
import { useCostDetails } from '@src/hooks/useCostDetails';
import { useGlobalState } from '@src/state';
import { formatARIOWithCommas } from '@src/utils';
import { useState } from 'react';

import { FundingSourceSelector } from '../../inputs/FundingSourceSelector/FundingSourceSelector';

export function TransactionDetails({
  details,
  fundingSourceCallback,
}: {
  details: AoGetCostDetailsParams;
  fundingSourceCallback?: (p: AoGetCostDetailsParams['fundFrom']) => void;
}) {
  const [{ arioTicker }] = useGlobalState();
  const [fundingSource, setFundingSource] =
    useState<AoGetCostDetailsParams['fundFrom']>('balance');
  const { data: costDetail } = useCostDetails({
    ...details,
    fundFrom: fundingSource,
  });

  const balanceUsed = costDetail?.fundingPlan
    ? new mARIOToken(costDetail.fundingPlan.balance).toARIO().valueOf()
    : 0;

  const stakeUsed = costDetail?.fundingPlan
    ? new mARIOToken(
        Object.values(costDetail.fundingPlan.stakes).reduce((acc, stake) => {
          acc = acc + stake.delegatedStake;
          acc =
            acc +
            Object.values(stake.vaults as any as Record<string, number>).reduce(
              (acc, vault) => acc + vault,
              0,
            );
          return acc;
        }, 0),
      )
        .toARIO()
        .valueOf()
    : 0;

  const discount = costDetail
    ? new mARIOToken(
        costDetail.discounts?.reduce((acc, d) => acc + d.discountTotal, 0),
      )
        .toARIO()
        .valueOf()
    : 0;

  // the cost is
  const initialCost =
    discount +
    (costDetail ? new mARIOToken(costDetail.tokenCost).toARIO().valueOf() : 0);
  const totalCost = costDetail
    ? new mARIOToken(costDetail.tokenCost).toARIO().valueOf()
    : 0;

  function handleChange(source: AoGetCostDetailsParams['fundFrom']) {
    setFundingSource(source);
    fundingSourceCallback?.(source);
  }

  return (
    <div className="flex flex-col justify-between h-fit gap-4 w-full">
      {' '}
      <div className="flex gap-10 w-full">
        <div className="flex flex-col gap-3 w-full">
          <span className="text-grey w-fit">Select payment method</span>
          <FundingSourceSelector
            details={details}
            onChange={(v) => handleChange(v)}
          />
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span
            className="text-white whitespace-nowrap"
            style={{ color: discount > 0 ? '' : 'transparent' }}
          >
            Initial Cost:&nbsp;
            <span className="">
              {formatARIOWithCommas(initialCost)}&nbsp;{arioTicker}
            </span>
          </span>

          <span
            className="text-error whitespace-nowrap"
            style={{ color: discount > 0 ? '' : 'transparent' }}
          >
            Operator discount:&nbsp;
            <span className="">
              -{formatARIOWithCommas(discount)}&nbsp;{arioTicker}
            </span>
          </span>

          <span className="text-white whitespace-nowrap">
            Total Cost:&nbsp;
            <span className="">
              {formatARIOWithCommas(totalCost)}&nbsp;{arioTicker}
            </span>
          </span>
        </div>
      </div>
      <div className="flex w-full border-b pb-4 border-dark-grey">
        <span className="flex w-full text-grey whitespace-nowrap justify-end text-[14px]">
          {(() => {
            if (!costDetail) return <></>;
            switch (fundingSource) {
              case 'balance': {
                return `(${formatARIOWithCommas(
                  balanceUsed,
                )} from liquid balance)`;
              }
              case 'stakes': {
                return `(${formatARIOWithCommas(
                  stakeUsed,
                )} from staked balance)`;
              }
              case 'any': {
                return `(${formatARIOWithCommas(
                  balanceUsed,
                )} from liquid balance + ${formatARIOWithCommas(
                  stakeUsed,
                )} from staked balance)`;
              }
              default:
                return '';
            }
          })()}
        </span>
      </div>
    </div>
  );
}
