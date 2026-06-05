import { FundFrom, mARIOToken } from '@ar.io/sdk';
import {
  useArIOLiquidBalance,
  useArIOStakedAndVaultedBalance,
} from '@src/hooks/useArIOBalance';
import { formatARIOWithCommas } from '@src/utils';
import { Circle, CircleCheck } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useMemo } from 'react';

/**
 * Three-way ARIO funding-source picker (Liquid / Liquid + Staked / Staked).
 * Shared between the Checkout flow and the Primary Name modal so the
 * available-source UX stays in lockstep — extracted from the original
 * inline radio in `PaymentOptionsForm`.
 *
 * `fundingSource` maps 1:1 onto the SDK's `FundFrom` discriminator:
 *   - `'balance'` → wallet's liquid ARIO balance only
 *   - `'any'`     → balance + delegations + pending vaults (funding-plan path)
 *   - `'stakes'`  → active delegations only (funding-plan path)
 */
export function ARIOFundingSelector({
  fundingSource,
  onChange,
}: {
  fundingSource: FundFrom;
  onChange: (next: FundFrom) => void;
}): JSX.Element {
  const { data: liquidBalance } = useArIOLiquidBalance();
  const { data: stakedAndVaultedBalance } = useArIOStakedAndVaultedBalance();

  const liquidArIOBalance = useMemo(
    () =>
      liquidBalance ? new mARIOToken(liquidBalance).toARIO().valueOf() : 0,
    [liquidBalance],
  );
  const stakedAndVaultedArIOBalance = useMemo(() => {
    if (!stakedAndVaultedBalance) return 0;
    return (
      new mARIOToken(stakedAndVaultedBalance.totalDelegatedStake)
        .toARIO()
        .valueOf() +
      new mARIOToken(stakedAndVaultedBalance.totalVaultedStake)
        .toARIO()
        .valueOf()
    );
  }, [stakedAndVaultedBalance]);
  const allArIOBalance = liquidArIOBalance + stakedAndVaultedArIOBalance;

  return (
    <Tabs.Root
      defaultValue={fundingSource}
      value={fundingSource}
      className="flex flex-col w-full h-full"
    >
      <Tabs.List
        className="flex flex-col w-full gap-2 text-white text-sm"
        defaultValue={'balance'}
      >
        <Tabs.Trigger
          value="balance"
          className="flex w-full gap-2 p-3 rounded bg-foreground data-[state=inactive]:bg-transparent border border-dark-grey items-center"
          onClick={() => onChange('balance')}
        >
          {fundingSource === 'balance' ? (
            <CircleCheck className="size-5 text-background fill-white" />
          ) : (
            <Circle className="size-5 text-grey" />
          )}
          <span className="font-bold">Liquid Balance</span> (
          {formatARIOWithCommas(liquidArIOBalance)} ARIO)
        </Tabs.Trigger>
        <Tabs.Trigger
          value="any"
          className="flex w-full gap-2 p-3 rounded bg-foreground data-[state=inactive]:bg-transparent border border-dark-grey items-center"
          onClick={() => onChange('any')}
        >
          {fundingSource === 'any' ? (
            <CircleCheck className="size-5 text-background fill-white" />
          ) : (
            <Circle className="size-5 text-grey" />
          )}
          <span className="font-bold">Liquid + Staked Balances</span> (
          {formatARIOWithCommas(allArIOBalance)} ARIO)
        </Tabs.Trigger>
        <Tabs.Trigger
          value="stakes"
          className="flex w-full gap-2 p-3 rounded bg-foreground data-[state=inactive]:bg-transparent border border-dark-grey items-center"
          onClick={() => onChange('stakes')}
        >
          {fundingSource === 'stakes' ? (
            <CircleCheck className="size-5 text-background fill-white" />
          ) : (
            <Circle className="size-5 text-grey" />
          )}{' '}
          <span className="font-bold">Staked Balances</span> (
          {formatARIOWithCommas(stakedAndVaultedArIOBalance)} ARIO)
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}

export default ARIOFundingSelector;
