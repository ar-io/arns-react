import { Tooltip } from '@src/components/data-display';
import { useIsMobile } from '@src/hooks';
import { useLatestANTVersion } from '@src/hooks/useANTVersions';
import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useModalState,
  useWalletState,
} from '@src/state';
import eventEmitter from '@src/utils/events';
import { useState } from 'react';

import { doAntsRequireUpdate } from '../../../utils';
import DomainsCardList from '../../data-display/cards/DomainsCardList';
import DomainsTable from '../../data-display/tables/DomainsTable';
import { RefreshIcon, SearchIcon } from '../../icons';
import './styles.css';

function Manage() {
  const [{ arioProcessId, aoNetwork, hyperbeamUrl }] = useGlobalState();
  const [{ loading: loadingArnsState, domains, ants }, dispatchArNSState] =
    useArNSState();
  const { data: antVersion } = useLatestANTVersion();
  const antModuleId = antVersion?.moduleId ?? null;
  const [{ walletAddress }] = useWalletState();
  const [, dispatchModalState] = useModalState();
  const [search, setSearch] = useState<string>('');
  const isMobile = useIsMobile();

  return (
    <div className="overflow-auto px-4 pb-[30px] pt-[10px] sm:px-[100px]">
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
          <div className="flex flex-col gap-2 border-[1px] border-b-0 border-dark-grey h-fit px-3 py-2 rounded-t-[2px] sm:flex-row sm:gap-0">
            {
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex w-full p-[5px]">
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

                <div className="flex gap-2 p-[5px] sm:ml-auto">
                  {!loadingArnsState &&
                    walletAddress &&
                    doAntsRequireUpdate({
                      ants,
                      userAddress: walletAddress.toString(),
                      currentModuleId: antModuleId,
                    }) && (
                      <Tooltip
                        message={'Your Domains require an update'}
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
                    onClick={() =>
                      walletAddress
                        ? dispatchArNSUpdate({
                            dispatch: dispatchArNSState,
                            walletAddress: walletAddress,
                            arioProcessId,
                            aoNetworkSettings: aoNetwork,
                            hyperbeamUrl,
                          })
                        : eventEmitter.emit('error', {
                            name: 'Manage Assets',
                            message: 'Connect wallet before refreshing',
                          })
                    }
                  >
                    <RefreshIcon
                      height={16}
                      width={16}
                      fill="var(--text-white)"
                    />
                  </button>
                </div>
              </div>
            }
          </div>

          {isMobile ? (
            <DomainsCardList
              domainData={{ names: domains, ants }}
              loading={loadingArnsState}
              filter={search}
              setFilter={(filter) => {
                setSearch(filter);
              }}
            />
          ) : (
            <DomainsTable
              domainData={{ names: domains, ants }}
              loading={loadingArnsState}
              filter={search}
              setFilter={(filter) => {
                setSearch(filter);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Manage;
