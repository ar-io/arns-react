import { FundFrom, mARIOToken } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { ArIOTokenIcon, TurboIcon } from '@src/components/icons';
import { SelectDropdown } from '@src/components/inputs/Select';
import {
  useArIOLiquidBalance,
  useArIOStakedAndVaultedBalance,
} from '@src/hooks/useArIOBalance';
import { useGlobalState } from '@src/state';
import { formatARIOWithCommas } from '@src/utils';
import { Circle, CircleCheck, CreditCard } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useMemo, useState } from 'react';

export type PaymentMethod = 'card' | 'crypto' | 'credits';
export type ARIOCryptoOptions = '$ARIO' | '$dARIO' | '$tARIO';
export type CryptoOptions = ARIOCryptoOptions;

function PaymentOptionsForm({
  fundingSource = 'balance',
  paymentMethod = 'crypto',
  onFundingSourceChange,
  onPaymentMethodChange,
}: {
  fundingSource?: FundFrom;
  paymentMethod?: PaymentMethod;
  onFundingSourceChange: (fundingSource: FundFrom) => void;
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void;
}) {
  const [{ arioTicker }] = useGlobalState();
  const formattedARIOTicker = `$${arioTicker}` as CryptoOptions;
  const cryptoDropdownOptions = useMemo(() => {
    return [{ label: formattedARIOTicker, value: formattedARIOTicker }];
  }, [arioTicker]);
  const { data: liquidBalance } = useArIOLiquidBalance();
  const { data: stakedAndVaultedBalance } = useArIOStakedAndVaultedBalance();

  const liquidArIOBalance = useMemo(() => {
    return liquidBalance ? new mARIOToken(liquidBalance).toARIO().valueOf() : 0;
  }, [liquidBalance]);
  const stakedAndVaultedArIOBalance = useMemo(() => {
    return stakedAndVaultedBalance
      ? new mARIOToken(stakedAndVaultedBalance.totalDelegatedStake)
          .toARIO()
          .valueOf() +
          new mARIOToken(stakedAndVaultedBalance.totalVaultedStake)
            .toARIO()
            .valueOf()
      : 0;
  }, [stakedAndVaultedBalance]);
  const allArIOBalance = useMemo(() => {
    return liquidArIOBalance + stakedAndVaultedArIOBalance;
  }, [liquidArIOBalance, stakedAndVaultedArIOBalance]);

  const [selectedCrypto, setSelectedCrypto] =
    useState<CryptoOptions>(formattedARIOTicker);

  const selectedCryptoBalance = useMemo(() => {
    if (selectedCrypto === formattedARIOTicker) {
      return allArIOBalance;
    }
    return 0;
  }, [selectedCrypto, allArIOBalance, formattedARIOTicker]);

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {/* tabs */}
        <Tabs.Root
          className="w-full text-white flex flex-col h-full"
          value={paymentMethod}
          onValueChange={(value) =>
            onPaymentMethodChange(value as PaymentMethod)
          }
        >
          <Tabs.List
            defaultValue={'crypto'}
            className="flex w-full justify-center items-center gap-2 mb-6"
          >
            <Tabs.Trigger
              value="card"
              disabled={true}
              className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-[#222224] data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap transition-all duration-300 disabled:opacity-50"
            >
              <Tooltip
                tooltipOverrides={{
                  arrow: false,
                  overlayInnerStyle: {
                    whiteSpace: 'nowrap',
                    width: 'fit-content',
                    padding: '0.625rem',
                    border: '1px solid var(--text-faded)',
                  },
                }}
                message="Coming Soon!"
                icon={
                  <div className="flex gap-3 items-center">
                    <CreditCard className="size-5 text-grey" />
                    Credit Card
                  </div>
                }
              />
            </Tabs.Trigger>
            <Tabs.Trigger
              value="crypto"
              className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-[#222224] data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap transition-all duration-300"
            >
              <ArIOTokenIcon className="size-5 text-grey fill-grey rounded-full border border-grey" />{' '}
              Crypto
            </Tabs.Trigger>
            <Tabs.Trigger
              value="credits"
              disabled={true}
              className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-[#222224] data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap transition-all duration-300 disabled:opacity-50"
            >
              <Tooltip
                tooltipOverrides={{
                  arrow: false,
                  overlayInnerStyle: {
                    whiteSpace: 'nowrap',
                    width: 'fit-content',
                    padding: '0.625rem',
                    border: '1px solid var(--text-faded)',
                  },
                }}
                message="Coming Soon!"
                icon={
                  <div className="flex gap-3 items-center">
                    <TurboIcon
                      className="size-5 text-grey"
                      stroke="var(--text-grey)"
                    />{' '}
                    Credits
                  </div>
                }
              />
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            value="card"
            className={`flex flex-col data-[state=active]:p-4 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0 data-[state=inactive]:opacity-0 data-[state=active]:min-h-[405px]`}
          >
            <span className="text-grey flex m-auto">Coming Soon!</span>
          </Tabs.Content>
          <Tabs.Content
            value="crypto"
            className={`flex flex-col data-[state=active]:p-6 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0 data-[state=inactive]:opacity-0 data-[state=active]:min-h-[405px]`}
          >
            {' '}
            <SelectDropdown
              value={selectedCrypto}
              onChange={(value) => setSelectedCrypto(value as CryptoOptions)}
              renderValue={() => (
                <span className="text-white flex w-full">{selectedCrypto}</span>
              )}
              className={{
                trigger:
                  'flex w-full gap-2 p-3 rounded-md bg-transparent border border-[#222224] items-center pointer-events-none',
                icon: 'text-transparent size-5',
              }}
              options={cryptoDropdownOptions}
            />
            <div className="flex size-full mt-4">
              <div className="flex flex-col gap-2 items-start">
                <span className="text-grey text-xs">
                  Your total {selectedCrypto} balance:
                </span>
                <span className="text-white text-2xl font-bold">
                  {formatARIOWithCommas(selectedCryptoBalance)} {selectedCrypto}
                </span>
              </div>
            </div>
            {selectedCrypto === formattedARIOTicker && (
              <div className="flex flex-col gap-2 size-full items-start">
                <span className="text-grey text-xs">
                  Select balance method:
                </span>
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
                      onClick={() => onFundingSourceChange('balance')}
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
                      onClick={() => onFundingSourceChange('any')}
                    >
                      {fundingSource === 'any' ? (
                        <CircleCheck className="size-5 text-background fill-white" />
                      ) : (
                        <Circle className="size-5 text-grey" />
                      )}
                      <span className="font-bold">
                        Liquid + Staked Balances
                      </span>{' '}
                      ({formatARIOWithCommas(allArIOBalance)} ARIO)
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="stakes"
                      className="flex w-full gap-2 p-3 rounded bg-foreground data-[state=inactive]:bg-transparent border border-dark-grey items-center"
                      onClick={() => onFundingSourceChange('stakes')}
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
              </div>
            )}
          </Tabs.Content>
          <Tabs.Content
            value="credits"
            className={`flex flex-col data-[state=active]:p-4 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0 data-[state=inactive]:opacity-0 data-[state=active]:min-h-[405px]`}
          >
            <span className="text-grey flex m-auto">Coming Soon!</span>
          </Tabs.Content>
        </Tabs.Root>{' '}
      </div>
    </>
  );
}

export default PaymentOptionsForm;
