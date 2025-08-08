import { Tooltip } from '@src/components/data-display';
import {
  useAntsForWallet,
  useAntsRequireUpdate,
} from '@src/hooks/useAntsForWallet';
import { useArNSRecordsForWallet } from '@src/hooks/useArNSRecordsForWallet';
import { useModalState, useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { useEffect, useState } from 'react';

import DomainsTable from '../../data-display/tables/DomainsTable';
import { RefreshIcon, SearchIcon } from '../../icons';
import './styles.css';

function Manage() {
  const [{ walletAddress }] = useWalletState();
  const [, dispatchModalState] = useModalState();
  const [search, setSearch] = useState<string>('');
  const {
    data: antData = {},
    isLoading: isLoadingAnts,
    isRefetching: isRefetchingAnts,
    refetch: refetchAnts,
  } = useAntsForWallet();
  const {
    data: domains = {},
    isLoading: isLoadingDomains,
    isRefetching: isRefetchingDomains,
    refetch: refetchDomains,
  } = useArNSRecordsForWallet();
  const { ants: antsRequireUpdate, isLoading: isLoadingAntsRequireUpdate } =
    useAntsRequireUpdate();
  const [isLoading, setIsLoading] = useState(isLoadingDomains || isLoadingAnts);

  useEffect(() => {
    setIsLoading(
      isLoadingDomains || isLoadingAnts || isLoadingAntsRequireUpdate,
    );
  }, [
    isLoadingDomains,
    isLoadingAnts,
    isRefetchingDomains,
    isRefetchingAnts,
    isLoadingAntsRequireUpdate,
  ]);

  return (
    <div className="overflow-auto px-[100px] pb-[30px] pt-[10px]">
      <div className="flex flex-col gap-[10px]">
        <div className="flex justify-start">
          <h1
            className="flex white text-[2rem]"
            style={{
              width: 'fit-content',
              whiteSpace: 'nowrap',
              marginTop: '0px',
            }}
          >
            Manage Assets
          </h1>
        </div>
        <div
          id="manage-table-wrapper"
          style={{
            position: 'relative',
            border: 'none',
            borderRadius: 'var(--corner-radius)',
            height: '100%',
            minHeight: '400px',
          }}
        >
          <div className="flex flex-row border-[1px] border-b-0 border-dark-grey h-fit px-3 py-1 rounded-t-[2px]">
            {
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
                    placeholder="Search your assets"
                  />
                </div>

                {!isLoading &&
                  walletAddress &&
                  antsRequireUpdate.length > 0 && (
                    <Tooltip
                      message={`${antsRequireUpdate.length} ANTs are eligible for an update`}
                      icon={
                        <button
                          onClick={() =>
                            dispatchModalState({
                              type: 'setModalOpen',
                              payload: { showUpgradeAntModal: true },
                            })
                          }
                          className="h-fit animate-pulse whitespace-nowrap rounded-[4px] bg-primary-thin px-4 py-1 text-sm text-primary transition-all hover:bg-primary hover:text-black"
                        >
                          Upgrade ANTs
                        </button>
                      }
                    />
                  )}
                <button
                  className={'button center pointer'}
                  onClick={() => {
                    if (walletAddress) {
                      refetchAnts();
                      refetchDomains();
                    } else {
                      eventEmitter.emit('error', {
                        name: 'Manage Assets',
                        message: 'Connect wallet before refreshing',
                      });
                    }
                  }}
                >
                  <RefreshIcon
                    height={16}
                    width={16}
                    fill="var(--text-white)"
                  />
                </button>
              </div>
            }
          </div>

          <DomainsTable
            domainData={{ names: domains, ants: antData }}
            loading={true}
            filter={search}
            setFilter={(filter) => {
              setSearch(filter);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Manage;
