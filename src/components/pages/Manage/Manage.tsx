import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useWalletState,
} from '@src/state';
import eventEmitter from '@src/utils/events';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DomainsTable from '../../data-display/tables/DomainsTable';
import { RefreshIcon, SearchIcon } from '../../icons';
import SyncOwnershipModal, {
  type SyncOwnershipItem,
} from '../../modals/ant-management/SyncOwnershipModal/SyncOwnershipModal';
import './styles.css';

function Manage() {
  const navigate = useNavigate();
  const [{ arioContract }] = useGlobalState();
  const [{ loading: loadingArnsState, domains, ants }, dispatchArNSState] =
    useArNSState();
  const [{ walletAddress, wallet }] = useWalletState();
  const [search, setSearch] = useState<string>('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // ANTs the wallet owns on-chain but that are missing from its ACL, grouped
  // by mint with the name(s) each backs (see `needsOwnerSync`).
  const outOfSyncItems = useMemo<SyncOwnershipItem[]>(() => {
    const mints = Object.entries(ants)
      .filter(([, ant]) => ant.needsOwnerSync)
      .map(([mint]) => mint);
    return mints.map((mint) => ({
      mint,
      names: Object.entries(domains)
        .filter(([, record]) => record.processId === mint)
        .map(([name]) => name),
    }));
  }, [ants, domains]);

  function refresh() {
    if (!walletAddress) return;
    dispatchArNSUpdate({
      dispatch: dispatchArNSState,
      walletAddress,
      wallet: wallet ?? undefined,
      arioContract,
    });
  }

  // Auto-open the Sync Ownership modal when arriving from the nav notification
  // (`/manage/names?syncOwnership=1`), once drift has actually been detected.
  // Consume the param so a refresh/back doesn't reopen it.
  useEffect(() => {
    if (searchParams.get('syncOwnership') && outOfSyncItems.length > 0) {
      setShowSyncModal(true);
      searchParams.delete('syncOwnership');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, outOfSyncItems, setSearchParams]);

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
          <div className="flex items-center gap-3">
            {outOfSyncItems.length > 0 && (
              <button
                onClick={() => setShowSyncModal(true)}
                className="whitespace-nowrap rounded-[4px] hidden md:flex items-center gap-2 border border-warning px-4 py-2 text-sm text-warning font-medium transition-all hover:bg-warning hover:text-black hover:scale-105"
              >
                Sync Ownership
                <span className="rounded-full bg-warning px-2 text-xs text-black">
                  {outOfSyncItems.length}
                </span>
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="whitespace-nowrap rounded-[4px] hidden md:block bg-primary px-4 py-2 text-sm text-black font-medium transition-all hover:bg-primary-dark hover:scale-105"
            >
              Register a Name
            </button>
          </div>
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

                <button
                  className={
                    'button center pointer transition-transform duration-200 ease-in-out hover:scale-105'
                  }
                  onClick={() =>
                    walletAddress
                      ? refresh()
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

      {showSyncModal && (
        <SyncOwnershipModal
          items={outOfSyncItems}
          closeModal={() => setShowSyncModal(false)}
          onSynced={refresh}
        />
      )}
    </div>
  );
}

export default Manage;
