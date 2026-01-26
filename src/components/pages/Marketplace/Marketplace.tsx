import { mARIOToken } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import MarketplaceListingsTable from '@src/components/data-display/tables/MarketplaceListingsTable';
import { InfoIcon, RefreshIcon, SearchIcon } from '@src/components/icons';
import { ManageMarketplaceARIOModal } from '@src/components/modals';
import { useMarketplaceUserAssets } from '@src/hooks/useMarketplaceUserAssets';
import { useGlobalState } from '@src/state';
import { formatARIO } from '@src/utils';
import { useState } from 'react';

export default function Marketplace() {
  const [{ arioTicker }] = useGlobalState();

  const [showManageModal, setShowManageModal] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleManageClick = () => {
    setShowManageModal(true);
  };

  const { data: userAssets } = useMarketplaceUserAssets();

  const handleCloseManageModal = () => {
    setShowManageModal(false);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="overflow-auto px-4 md:px-[100px] pb-[30px] pt-[10px]">
      <div className="flex flex-col gap-[10px]">
        <div className="flex justify-between gap-2">
          <h1 className="flex white text-[2rem] w-fit whitespace-nowrap items-center gap-2">
            ArNS Marketplace{' '}
          </h1>
          <div className="flex flex-col bg-foreground p-2 gap-2 rounded border border-primary-thin">
            <div className="flex flex-row justify-between items-center">
              <span className="flex text-white text-md whitespace-nowrap items-center gap-2">
                Marketplace Balances{' '}
                <Tooltip
                  message="Deposited marketplace balances. Liquid balance is available for use in marketplace listings. Locked balance is locked in active orders."
                  icon={
                    <InfoIcon width={16} height={16} fill="var(--text-grey)" />
                  }
                />
              </span>{' '}
              <button
                onClick={handleManageClick}
                className="whitespace-nowrap rounded bg-primary-thin transition-all hover:bg-primary py-1 px-2 text-sm text-primary hover:text-black"
              >
                Manage
              </button>
            </div>

            <div className="flex flex-row gap-2">
              <div className="flex flex-row w-full justify-between items-center">
                <span className="text-sm text-grey whitespace-nowrap">
                  Liquid Balance:
                </span>
                <span className="text-sm text-white whitespace-nowrap">
                  {formatARIO(
                    new mARIOToken(Number(userAssets?.balances?.balance ?? 0))
                      .toARIO()
                      .valueOf(),
                  )}{' '}
                  {arioTicker}
                </span>
              </div>
              <div className="flex flex-row w-full justify-between items-center">
                <span className="text-sm text-grey whitespace-nowrap">
                  Locked Balance:
                </span>
                <span className="text-sm text-white whitespace-nowrap">
                  {formatARIO(
                    new mARIOToken(
                      Number(userAssets?.balances?.lockedBalance ?? 0),
                    )
                      .toARIO()
                      .valueOf(),
                  )}{' '}
                  {arioTicker}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col border border-dark-grey rounded relative">
          <div className="flex flex-row border-b border-dark-grey h-fit px-3 py-1 mb-2">
            <div className="flex w-full flex-row">
              <div className="flex w-full p-[5px]">
                <SearchIcon
                  width={'18px'}
                  height={'18px'}
                  className="fill-white absolute top-[12.5px]"
                />
                <input
                  className="pl-7 flex bg-background w-full focus:outline-none text-white placeholder:text-dark-grey"
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  value={search}
                  placeholder="Search marketplace listings"
                />
              </div>

              <button
                className={
                  'button center pointer transition-transform duration-200 ease-in-out hover:scale-105'
                }
                onClick={handleRefresh}
              >
                <RefreshIcon height={16} width={16} fill="var(--text-white)" />
              </button>
            </div>
          </div>

          <MarketplaceListingsTable
            filter={search}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Manage Marketplace Balance Modal */}
      <ManageMarketplaceARIOModal
        show={showManageModal}
        onClose={handleCloseManageModal}
      />
    </div>
  );
}
