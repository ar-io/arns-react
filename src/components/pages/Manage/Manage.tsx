import { Tooltip } from '@src/components/data-display';
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
import { useNavigate } from 'react-router-dom';

import { doAntsRequireUpdate } from '../../../utils';
import DomainsTable from '../../data-display/tables/DomainsTable';
import { RefreshIcon, SearchIcon } from '../../icons';
import './styles.css';

function Manage() {
  const navigate = useNavigate();
  const [{ arioProcessId, aoNetwork, hyperbeamUrl, antRegistryProcessId }] =
    useGlobalState();
  const [{ loading: loadingArnsState, domains, ants }, dispatchArNSState] =
    useArNSState();
  const { data: antVersion } = useLatestANTVersion();
  const antModuleId = antVersion?.moduleId ?? null;
  const [{ walletAddress }] = useWalletState();
  const [, dispatchModalState] = useModalState();
  const [search, setSearch] = useState<string>('');

  return (
    <div className="overflow-auto px-4 md:px-[100px] pb-[30px] pt-[10px]">
      <div className="flex flex-col gap-[10px]">
        <div className="flex justify-between items-center">
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
          <button
            onClick={() => navigate('/')}
            className="whitespace-nowrap rounded-[4px] hidden md:block bg-primary px-4 py-2 text-sm text-black font-medium transition-all hover:bg-primary-dark hover:scale-105"
          >
            Register a Name
          </button>
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
                          className="h-fit animate-pulse whitespace-nowrap rounded-[4px] bg-primary-thin px-4 py-1 text-sm text-primary transition-all hover:bg-primary hover:text-black hover:scale-105"
                        >
                          Upgrade ANTs
                        </button>
                      }
                    />
                  )}
                <button
                  className={
                    'button center pointer transition-transform duration-200 ease-in-out hover:scale-105'
                  }
                  onClick={() =>
                    walletAddress
                      ? dispatchArNSUpdate({
                          dispatch: dispatchArNSState,
                          walletAddress: walletAddress,
                          arioProcessId,
                          antRegistryProcessId,
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
            }
          </div>

          <DomainsTable
            domainData={{ names: domains, ants }}
            loading={loadingArnsState}
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
